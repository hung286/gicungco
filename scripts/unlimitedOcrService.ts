import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip
} from 'docx';

export interface UnlimitedOcrFigure {
  id: string;
  dataUrl: string;
  widthPx?: number;
  heightPx?: number;
  wordWidthPx?: number;
  wordHeightPx?: number;
  caption?: string;
}

export interface UnlimitedOcrRequest {
  images: string[];
  engine?: 'gemini' | 'auto' | 'unlimited';
  geminiApiKey?: string;
  backendUrl?: string;
  apiKey?: string;
  model?: string;
  prompt?: string;
  slidingWindow?: number;
  maxTokens?: number;
}

export interface UnlimitedOcrHealthRequest {
  backendUrl?: string;
  apiKey?: string;
}

export interface UnlimitedOcrDocxRequest {
  markdown: string;
  title?: string;
  fileName?: string;
  fontName?: string;
  fontSizePt?: number;
  figures?: UnlimitedOcrFigure[];
}

const DEFAULT_PROMPT = [
  'Transcribe this Vietnamese math/science exam document into clean, structured Markdown.',
  'Use LaTeX for all mathematical formulas ($...$ for inline math, $$...$$ for display math).',
  'Preserve Vietnamese diacritics, headings (PHẦN I, PHẦN II, PHẦN III), question numbers (Câu 1., Câu 2., ...),',
  'answer choices (A., B., C., D. and a), b), c), d)), and render tables as Markdown tables.'
].join(' ');

function normalizeBaseUrl(raw?: string): string {
  const candidate = String(raw || process.env.UNLIMITED_OCR_URL || 'http://127.0.0.1:8000').trim();
  return candidate.replace(/\/+$/, '');
}

function ensureDataUrl(img: string): string {
  const s = String(img || '').trim();
  if (!s) return '';
  if (s.startsWith('data:image/')) return s;
  return `data:image/png;base64,${s}`;
}

export async function handleUnlimitedOcrHealth(body: UnlimitedOcrHealthRequest) {
  const baseUrl = normalizeBaseUrl(body?.backendUrl);
  const headers: Record<string, string> = {};
  if (body?.apiKey) headers['Authorization'] = `Bearer ${body.apiKey.trim()}`;

  const probes = [
    { path: '/health', protocol: 'fastapi' },
    { path: '/v1/models', protocol: 'vllm' }
  ];

  for (const probe of probes) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(`${baseUrl}${probe.path}`, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      clearTimeout(timer);
      if (resp.ok) {
        let info: any = null;
        try {
          info = await resp.json();
        } catch {
          info = await resp.text();
        }
        return {
          ok: true,
          backendUrl: baseUrl,
          protocol: probe.protocol,
          endpoint: `${baseUrl}${probe.path}`,
          info
        };
      }
    } catch {
      // try next probe
    }
  }

  return {
    ok: false,
    backendUrl: baseUrl,
    error: `Không kết nối được backend Unlimited-OCR tại ${baseUrl}. Hãy khởi động server (scripts/unlimited_ocr_server.py hoặc vllm serve baidu/Unlimited-OCR) hoặc nhập đúng URL Colab/Tunnel.`
  };
}

function parseDataUrlParts(dataUrl: string): { mimeType: string; data: string } {
  const m = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/i);
  if (m) return { mimeType: m[1], data: m[2] };
  return { mimeType: 'image/png', data: String(dataUrl || '').replace(/^data:[^,]+,/, '') };
}

function resolveGeminiApiKey(explicitKey?: string): string {
  const raw = String(explicitKey || '').split(/[\n,;\t]+/)[0].trim();
  if (raw && raw !== 'MY_GEMINI_API_KEY' && raw.startsWith('AIza')) return raw;
  const envKey = String(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '')
    .split(/[\n,;\t]+/)[0]
    .trim();
  if (envKey && envKey !== 'MY_GEMINI_API_KEY') return envKey;
  return raw && raw !== 'MY_GEMINI_API_KEY' ? raw : '';
}

async function runGeminiVisionOcr(images: string[], prompt: string, explicitKey?: string) {
  const apiKey = resolveGeminiApiKey(explicitKey);
  if (!apiKey) {
    throw new Error(
      'Chưa có Gemini API Key. Hãy nhập API Key tại nút ⚙️ Cấu hình hệ thống (hoặc dán Gemini API Key vào ô Bước 1).'
    );
  }

  const parts: any[] = images.map((img) => {
    const parsed = parseDataUrlParts(img);
    return { inlineData: { mimeType: parsed.mimeType, data: parsed.data } };
  });
  parts.push({
    text:
      prompt +
      '\nChỉ trả về nội dung Markdown + LaTeX thuần (không bọc trong ```markdown, không giải thích thừa).'
  });

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  const errs: string[] = [];

  for (const modelName of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
        })
      });
      if (!resp.ok) {
        const errTxt = await resp.text().catch(() => '');
        errs.push(`${modelName} HTTP ${resp.status}: ${errTxt.slice(0, 180)}`);
        continue;
      }
      const data: any = await resp.json();
      const textParts = data?.candidates?.[0]?.content?.parts || [];
      let markdown = textParts
        .map((p: any) => p?.text || '')
        .join('\n')
        .trim();
      markdown = markdown.replace(/^```(?:markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      if (!markdown) {
        errs.push(`${modelName}: kết quả rỗng`);
        continue;
      }
      return {
        ok: true,
        markdown,
        pagesProcessed: images.length,
        model: modelName,
        protocol: `Gemini AI Cloud (${modelName})`,
        backendUrl: 'Gemini Cloud API'
      };
    } catch (e: any) {
      errs.push(`${modelName}: ${e?.message || e}`);
    }
  }

  throw new Error(`Không gọi được Gemini AI Cloud OCR.\nChi tiết: ${errs.join(' | ')}`);
}

export async function handleUnlimitedOcr(body: UnlimitedOcrRequest) {
  const images = Array.isArray(body?.images) ? body.images.map(ensureDataUrl).filter(Boolean) : [];
  if (images.length === 0) {
    throw new Error('Chưa có ảnh trang PDF/ảnh đề nào để nhận diện OCR.');
  }

  const engine = body?.engine || 'auto';
  const prompt = String(body?.prompt || DEFAULT_PROMPT).trim();

  // Direct Gemini Cloud OCR mode (works everywhere without local GPU server)
  if (engine === 'gemini') {
    return runGeminiVisionOcr(images, prompt, body?.geminiApiKey);
  }

  const baseUrl = normalizeBaseUrl(body?.backendUrl);
  const model = String(body?.model || process.env.UNLIMITED_OCR_MODEL || 'baidu/Unlimited-OCR').trim();
  const slidingWindow = Number(body?.slidingWindow) > 0 ? Number(body.slidingWindow) : 128;
  const maxTokens = Number(body?.maxTokens) > 0 ? Number(body.maxTokens) : 8192;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (body?.apiKey) {
    headers['Authorization'] = `Bearer ${body.apiKey.trim()}`;
  }

  // 1) Try custom FastAPI /parse endpoint first (scripts/unlimited_ocr_server.py)
  const errors: string[] = [];
  try {
    const resp = await fetch(`${baseUrl}/parse`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        images,
        prompt,
        sliding_window: slidingWindow,
        max_tokens: maxTokens,
        model
      })
    });
    if (resp.ok) {
      const data: any = await resp.json();
      const markdown = String(data?.markdown ?? data?.text ?? data?.result ?? '').trim();
      if (markdown) {
        return {
          ok: true,
          markdown,
          pagesProcessed: images.length,
          model: data?.model || model,
          protocol: 'fastapi:/parse',
          backendUrl: baseUrl
        };
      }
    } else if (resp.status !== 404 && resp.status !== 405) {
      const errText = await resp.text().catch(() => '');
      errors.push(`/parse HTTP ${resp.status}: ${errText.slice(0, 200)}`);
    }
  } catch (e: any) {
    errors.push(`/parse: ${e?.message || e}`);
  }

  // 2) Fallback to vLLM / OpenAI-compatible /v1/chat/completions (supports multi-image one-shot R-SWA)
  const contentParts: any[] = images.map((imgUrl) => ({
    type: 'image_url',
    image_url: { url: imgUrl }
  }));
  contentParts.push({ type: 'text', text: prompt });

  const chatEndpoint = baseUrl.endsWith('/v1/chat/completions')
    ? baseUrl
    : `${baseUrl}/v1/chat/completions`;

  try {
    const resp = await fetch(chatEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: contentParts }],
        temperature: 0.0,
        max_tokens: maxTokens,
        extra_body: {
          skip_special_tokens: false,
          sliding_window: slidingWindow
        }
      })
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status}: ${errText.slice(0, 300)}`);
    }

    const data: any = await resp.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    const markdown = Array.isArray(rawContent)
      ? rawContent.map((c: any) => c?.text || '').join('\n').trim()
      : String(rawContent || '').trim();

    if (!markdown) {
      throw new Error('Backend Unlimited-OCR trả về kết quả rỗng.');
    }

    return {
      ok: true,
      markdown,
      pagesProcessed: images.length,
      model: data?.model || model,
      protocol: 'vllm:/v1/chat/completions',
      backendUrl: baseUrl
    };
  } catch (e: any) {
    errors.push(`/v1/chat/completions: ${e?.message || e}`);
    // Auto-fallback to Gemini Vision Cloud if key is available
    const fallbackKey = resolveGeminiApiKey(body?.geminiApiKey);
    if (fallbackKey) {
      return runGeminiVisionOcr(images, prompt, fallbackKey);
    }
    throw new Error(
      `Không thể kết nối backend Unlimited-OCR tại ${baseUrl} và chưa có Gemini API Key dự phòng.\nHãy chuyển sang chế độ "✨ Gemini AI Cloud" (không cần chạy server) hoặc khởi động server Unlimited-OCR.\nChi tiết: ${errors.join(' | ')}`
    );
  }
}

/**
 * Parse inline markdown (**bold**, *italic*) and bold exam prefixes (Câu X., A., B., C., D., a), b), c), d))
 * while keeping LaTeX math ($...$ and $$...$$) 100% intact for Word / MH2026 Toggle TeX.
 */
function parseInlineRuns(line: string, fontName: string, fontSizeHalfPt: number): TextRun[] {
  const runs: TextRun[] = [];

  // Highlight Vietnamese exam prefixes at start of paragraph
  const prefixMatch = line.match(
    /^((?:Câu|Bài)\s+\d+\s*[.:)]|PHẦN\s+[IVX0-9]+[.:]?|[A-D]\.|[a-d]\))\s*(.*)$/i
  );
  let remaining = line;
  if (prefixMatch) {
    runs.push(
      new TextRun({
        text: `${prefixMatch[1]} `,
        bold: true,
        font: fontName,
        size: fontSizeHalfPt
      })
    );
    remaining = prefixMatch[2] || '';
  }

  // Split by LaTeX segments first so we never corrupt * or _ inside $...$ or $$...$$
  const mathSplit = remaining.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);

  for (const segment of mathSplit) {
    if (!segment) continue;
    if (
      (segment.startsWith('$$') && segment.endsWith('$$')) ||
      (segment.startsWith('$') && segment.endsWith('$'))
    ) {
      runs.push(
        new TextRun({
          text: segment,
          font: fontName,
          size: fontSizeHalfPt
        })
      );
      continue;
    }

    // Parse **bold** and *italic* in non-math prose
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;
    while ((m = tokenRegex.exec(segment)) !== null) {
      if (m.index > lastIdx) {
        runs.push(
          new TextRun({
            text: segment.slice(lastIdx, m.index),
            font: fontName,
            size: fontSizeHalfPt
          })
        );
      }
      const tok = m[0];
      if (tok.startsWith('**') && tok.endsWith('**')) {
        runs.push(
          new TextRun({
            text: tok.slice(2, -2),
            bold: true,
            font: fontName,
            size: fontSizeHalfPt
          })
        );
      } else if (tok.startsWith('*') && tok.endsWith('*')) {
        runs.push(
          new TextRun({
            text: tok.slice(1, -1),
            italics: true,
            font: fontName,
            size: fontSizeHalfPt
          })
        );
      }
      lastIdx = m.index + tok.length;
    }
    if (lastIdx < segment.length) {
      runs.push(
        new TextRun({
          text: segment.slice(lastIdx),
          font: fontName,
          size: fontSizeHalfPt
        })
      );
    }
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text: '', font: fontName, size: fontSizeHalfPt }));
  }
  return runs;
}

function isMarkdownTableSeparator(line: string): boolean {
  return /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(line.trim());
}

function splitMarkdownTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((c) => c.trim());
}

export function normalizeVietnameseMathMarkdown(raw: string): string {
  let s = String(raw || '').replace(/\r\n/g, '\n');
  // Convert \( ... \) -> $ ... $ and \[ ... \] -> $$ ... $$
  s = s.replace(/\\\((.+?)\\\)/g, (_, inner) => `$${inner.trim()}$`);
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_, inner) => `$$${inner.trim()}$$`);
  // Clean common OCR math glitches
  s = s.replace(/\\vec\s*\{([A-Z]{2})\}/g, '\\overrightarrow{$1}');
  s = s.replace(/\\frac\s*\{/g, '\\dfrac{');
  // Ensure clean space after Câu X. / A. / B. / C. / D. / a)
  s = s.replace(/^((?:Câu|Bài)\s+\d+\s*[.:)])([^\s])/gim, '$1 $2');
  s = s.replace(/^([A-D]\.|[a-d]\))([^\s])/gm, '$1 $2');
  return s.trim();
}

export async function buildDocxFromMarkdown(body: UnlimitedOcrDocxRequest): Promise<Buffer> {
  const markdown = normalizeVietnameseMathMarkdown(String(body?.markdown || ''));
  if (!markdown.trim()) {
    throw new Error('Nội dung Markdown rỗng, không thể xuất file Word.');
  }

  const fontName = body?.fontName || 'Times New Roman';
  const fontSizePt = Number(body?.fontSizePt) > 0 ? Number(body.fontSizePt) : 12;
  const fontSizeHalfPt = Math.round(fontSizePt * 2);

  const figureMap = new Map<string, UnlimitedOcrFigure>();
  if (Array.isArray(body?.figures)) {
    for (const f of body.figures) {
      if (f?.id && f?.dataUrl) {
        figureMap.set(f.id, f);
      }
    }
  }

  const noBorder = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  };

  const makeOptionCell = (optLine: string, colWidthPct: number) =>
    new TableCell({
      width: { size: colWidthPct, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      borders: noBorder,
      margins: { top: 30, bottom: 30, left: 60, right: 80 },
      children: [
        new Paragraph({
          spacing: { before: 15, after: 15, line: 260 },
          children: parseInlineRuns(optLine, fontName, fontSizeHalfPt)
        })
      ]
    });

  const children: Array<Paragraph | Table> = [];

  if (body?.title && body.title.trim()) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 },
        children: [
          new TextRun({
            text: body.title.trim(),
            bold: true,
            font: fontName,
            size: fontSizeHalfPt + 4
          })
        ]
      })
    );
  }

  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Blank line
    if (!trimmed) {
      i++;
      continue;
    }

    // Embedded cropped / regenerated figure: ![Caption](fig:fig_1) or [[HINH_fig_1]]
    const figMatch =
      trimmed.match(/^!\[([^\]]*)\]\(fig:([a-zA-Z0-9_-]+)\)$/) ||
      trimmed.match(/^\[\[HINH_([a-zA-Z0-9_-]+)\]\]$/);
    if (figMatch) {
      const figId = figMatch.length === 3 ? figMatch[2] : figMatch[1];
      const figCaption = figMatch.length === 3 ? figMatch[1] : '';
      const fig = figureMap.get(figId);
      if (fig && fig.dataUrl) {
        const b64 = fig.dataUrl.includes(',') ? fig.dataUrl.split(',')[1] : fig.dataUrl;
        const imgBuf = Buffer.from(b64, 'base64');
        // Exact 1:1 physical scale with original PDF (Word uses 96 DPI = 4/3 px per PDF pt)
        const physW = Math.max(24, Number(fig.wordWidthPx) || Math.round((Number(fig.widthPx) || 360) * 0.4444));
        const physH = Math.max(24, Number(fig.wordHeightPx) || Math.round((Number(fig.heightPx) || 240) * 0.4444));
        // Only cap if wider than A4 printable width (18.0 cm = 680 px at 96 DPI), keeping exact aspect ratio
        const maxPageW = 680;
        const maxPageH = 920;
        const scale = Math.min(1, maxPageW / physW, maxPageH / physH);
        const targetW = Math.round(physW * scale);
        const targetH = Math.round(physH * scale);

        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: figCaption ? 30 : 80 },
            children: [
              new ImageRun({
                type: 'png',
                data: imgBuf,
                transformation: { width: targetW, height: targetH }
              })
            ]
          })
        );
        if (figCaption && !/^H[iì]nh\s*\d*$/i.test(figCaption.trim())) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 80 },
              children: [
                new TextRun({
                  text: figCaption.trim(),
                  italics: true,
                  font: fontName,
                  size: fontSizeHalfPt - 2
                })
              ]
            })
          );
        }
      }
      i++;
      continue;
    }

    // Group 4 consecutive A., B., C., D. option lines into a clean 4-col / 2-col borderless table
    if (
      /^A\.\s*/.test(trimmed) &&
      i + 3 < lines.length &&
      /^B\.\s*/.test(lines[i + 1].trim()) &&
      /^C\.\s*/.test(lines[i + 2].trim()) &&
      /^D\.\s*/.test(lines[i + 3].trim())
    ) {
      const opts = [
        lines[i].trim(),
        lines[i + 1].trim(),
        lines[i + 2].trim(),
        lines[i + 3].trim()
      ];
      const maxLen = Math.max(...opts.map((o) => o.replace(/\$+/g, '').length));
      if (maxLen <= 22) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorder,
            rows: [
              new TableRow({
                children: opts.map((o) => makeOptionCell(o, 25))
              })
            ]
          })
        );
        i += 4;
        continue;
      } else if (maxLen <= 46) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorder,
            rows: [
              new TableRow({ children: [makeOptionCell(opts[0], 50), makeOptionCell(opts[1], 50)] }),
              new TableRow({ children: [makeOptionCell(opts[2], 50), makeOptionCell(opts[3], 50)] })
            ]
          })
        );
        i += 4;
        continue;
      }
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 120 },
          border: {
            bottom: {
              color: '334155',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6
            }
          },
          children: []
        })
      );
      i++;
      continue;
    }

    // Multi-line display math block $$ ... $$
    if (trimmed.startsWith('$$') && !trimmed.endsWith('$$')) {
      const mathLines = [trimmed];
      i++;
      while (i < lines.length) {
        mathLines.push(lines[i].trim());
        if (lines[i].trim().endsWith('$$')) {
          i++;
          break;
        }
        i++;
      }
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 80 },
          children: [
            new TextRun({
              text: mathLines.join(' '),
              font: fontName,
              size: fontSizeHalfPt
            })
          ]
        })
      );
      continue;
    }

    // Markdown Table
    if (trimmed.includes('|') && i + 1 < lines.length && isMarkdownTableSeparator(lines[i + 1])) {
      const headerCells = splitMarkdownTableRow(trimmed);
      const rowsData: string[][] = [headerCells];
      i += 2; // skip header + separator
      while (i < lines.length && lines[i].trim().includes('|') && !isMarkdownTableSeparator(lines[i])) {
        rowsData.push(splitMarkdownTableRow(lines[i]));
        i++;
      }

      const maxCols = Math.max(...rowsData.map((r) => r.length), 1);
      const tableRows = rowsData.map((row, rIdx) => {
        const padded = Array.from({ length: maxCols }, (_, cIdx) => row[cIdx] || '');
        return new TableRow({
          tableHeader: rIdx === 0,
          children: padded.map(
            (cellText) =>
              new TableCell({
                shading:
                  rIdx === 0
                    ? { type: ShadingType.CLEAR, fill: 'E2E8F0', color: 'auto' }
                    : undefined,
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [
                  new Paragraph({
                    alignment: rIdx === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                    spacing: { before: 20, after: 20 },
                    children: parseInlineRuns(
                      rIdx === 0 ? `**${cellText.replace(/\*\*/g, '')}**` : cellText,
                      fontName,
                      fontSizeHalfPt - 2
                    )
                  })
                ]
              })
          )
        });
      });

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        })
      );
      children.push(new Paragraph({ spacing: { before: 0, after: 60 }, children: [] }));
      continue;
    }

    // Headings (#, ##, ###)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4
      };
      children.push(
        new Paragraph({
          heading: headingMap[level] || HeadingLevel.HEADING_2,
          spacing: { before: 140, after: 80 },
          children: [
            new TextRun({
              text,
              bold: true,
              font: fontName,
              size: level === 1 ? fontSizeHalfPt + 4 : level === 2 ? fontSizeHalfPt + 2 : fontSizeHalfPt
            })
          ]
        })
      );
      i++;
      continue;
    }

    // Single-line display math $$ ... $$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: trimmed,
              font: fontName,
              size: fontSizeHalfPt
            })
          ]
        })
      );
      i++;
      continue;
    }

    // Regular paragraph / question / option
    const isPartHeader = /^PHẦN\s+[IVX0-9]+/i.test(trimmed);
    const isOptionLine = /^[A-D]\.|^[a-d]\)/.test(trimmed);
    children.push(
      new Paragraph({
        spacing: {
          before: isPartHeader ? 160 : isOptionLine ? 30 : 70,
          after: isOptionLine ? 40 : 60,
          line: 276
        },
        indent: isOptionLine ? { left: convertMillimetersToTwip(5) } : undefined,
        children: parseInlineRuns(trimmed, fontName, fontSizeHalfPt)
      })
    );
    i++;
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297)
            },
            margin: {
              top: convertMillimetersToTwip(15),
              bottom: convertMillimetersToTwip(15),
              left: convertMillimetersToTwip(15),
              right: convertMillimetersToTwip(15)
            }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBuffer(doc);
}
