import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export type TikzOutputFormat = 'svg' | 'pdf' | 'png' | 'all';

export interface RenderTikzOptions {
  format?: TikzOutputFormat;
  borderPt?: number;
  dpi?: number;
  extraPreamble?: string;
  timeoutMs?: number;
}

export interface RenderTikzResult {
  svg?: string;
  svgDataUrl?: string;
  pdfBase64?: string;
  pngBase64?: string;
  pngDataUrl?: string;
  width?: string;
  height?: string;
  viewBox?: string;
}

const DEFAULT_LIBRARIES = [
  'calc',
  'angles',
  'quotes',
  'intersections',
  'patterns',
  '3d',
  'arrows.meta',
  'positioning',
  'decorations.markings',
  'decorations.pathreplacing',
  'shapes.geometric',
].join(',');

/**
 * Wraps a TikZ snippet (or raw TikZ commands) in a `standalone` LaTeX document
 * with tight auto-cropping around the figure.
 */
export function buildStandaloneTex(
  tikzCode: string,
  options: Pick<RenderTikzOptions, 'borderPt' | 'extraPreamble'> = {}
): string {
  const trimmed = String(tikzCode || '').trim();
  if (!trimmed) {
    throw new Error('Mã TikZ trống.');
  }

  if (/\\documentclass\b/.test(trimmed)) {
    return trimmed;
  }

  const borderPt = Number.isFinite(options.borderPt)
    ? Math.max(0, Math.min(30, Number(options.borderPt)))
    : 2;

  const hasTikzEnv = /\\begin\{tikzpicture\}/.test(trimmed);
  const body = hasTikzEnv
    ? trimmed
    : `\\begin{tikzpicture}\n${trimmed}\n\\end{tikzpicture}`;

  const extra = options.extraPreamble ? `${options.extraPreamble.trim()}\n` : '';

  return [
    `\\documentclass[tikz,border=${borderPt}pt]{standalone}`,
    '\\usepackage[utf8]{inputenc}',
    '\\usepackage[T5]{fontenc}',
    '\\usepackage{amsmath,amssymb,tikz,pgfplots}',
    `\\usetikzlibrary{${DEFAULT_LIBRARIES}}`,
    '\\pgfplotsset{compat=1.18}',
    extra + '\\begin{document}',
    body,
    '\\end{document}',
    '',
  ].join('\n');
}

function extractLatexError(stdout: string, logText: string): string {
  const combined = `${stdout || ''}\n${logText || ''}`;
  const lines = combined.split(/\r?\n/);
  const errLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('!')) {
      errLines.push(lines[i]);
      if (lines[i + 1]) errLines.push(lines[i + 1]);
      if (lines[i + 2]) errLines.push(lines[i + 2]);
      break;
    }
  }
  if (errLines.length > 0) return errLines.join(' ').trim();
  const tail = lines.filter((l) => l.trim()).slice(-6).join(' | ');
  return tail || 'Biên dịch pdflatex thất bại.';
}

function parseSvgDimensions(svg: string): { width?: string; height?: string; viewBox?: string } {
  const tagMatch = svg.match(/<svg\b([^>]*)>/i);
  if (!tagMatch) return {};
  const attrs = tagMatch[1];
  const width = attrs.match(/\bwidth=['"]([^'"]+)['"]/i)?.[1];
  const height = attrs.match(/\bheight=['"]([^'"]+)['"]/i)?.[1];
  const viewBox = attrs.match(/\bviewBox=['"]([^'"]+)['"]/i)?.[1];
  return { width, height, viewBox };
}

/**
 * Compiles TikZ/LaTeX code into cropped vector SVG/PDF (and optional high-DPI PNG).
 */
export async function renderTikz(
  tikzCode: string,
  options: RenderTikzOptions = {}
): Promise<RenderTikzResult> {
  const format: TikzOutputFormat = options.format || 'svg';
  const dpi = Number.isFinite(options.dpi) ? Math.max(72, Math.min(600, Number(options.dpi))) : 300;
  const timeoutMs = Number.isFinite(options.timeoutMs) ? Number(options.timeoutMs) : 30000;

  const texSource = buildStandaloneTex(tikzCode, {
    borderPt: options.borderPt,
    extraPreamble: options.extraPreamble,
  });

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'webgame-tikz-'));
  const texPath = path.join(tmpDir, 'figure.tex');
  const pdfPath = path.join(tmpDir, 'figure.pdf');
  const svgPath = path.join(tmpDir, 'figure.svg');
  const pngPath = path.join(tmpDir, 'figure.png');
  const logPath = path.join(tmpDir, 'figure.log');

  try {
    fs.writeFileSync(texPath, texSource, 'utf8');

    try {
      await execFileAsync(
        'pdflatex',
        ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', tmpDir, texPath],
        { timeout: timeoutMs, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }
      );
    } catch (err: any) {
      const logText = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
      const msg = extractLatexError(err?.stdout || '', logText);
      throw new Error(`Lỗi biên dịch TikZ/LaTeX: ${msg}`);
    }

    if (!fs.existsSync(pdfPath)) {
      throw new Error('pdflatex không tạo được file PDF đầu ra.');
    }

    const result: RenderTikzResult = {};

    if (format === 'pdf' || format === 'all') {
      const pdfBuf = fs.readFileSync(pdfPath);
      result.pdfBase64 = pdfBuf.toString('base64');
    }

    if (format === 'svg' || format === 'all') {
      await execFileAsync(
        'dvisvgm',
        ['--pdf', '--exact-bbox', '--no-fonts', '-o', svgPath, pdfPath],
        { timeout: timeoutMs, windowsHide: true, maxBuffer: 8 * 1024 * 1024 }
      );
      if (!fs.existsSync(svgPath)) {
        throw new Error('dvisvgm không tạo được file SVG đầu ra.');
      }
      const svg = fs.readFileSync(svgPath, 'utf8');
      result.svg = svg;
      result.svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
      Object.assign(result, parseSvgDimensions(svg));
    }

    if (format === 'png' || format === 'all') {
      try {
        await execFileAsync(
          'magick',
          ['-density', String(dpi), pdfPath, '-background', 'white', '-alpha', 'remove', '-alpha', 'off', pngPath],
          { timeout: timeoutMs, windowsHide: true, maxBuffer: 8 * 1024 * 1024 }
        );
        if (fs.existsSync(pngPath)) {
          const pngBase64 = fs.readFileSync(pngPath).toString('base64');
          result.pngBase64 = pngBase64;
          result.pngDataUrl = `data:image/png;base64,${pngBase64}`;
        }
      } catch (pngErr: any) {
        if (format === 'png') {
          throw new Error(`Không thể chuyển PDF sang PNG: ${pngErr?.message || pngErr}`);
        }
      }
    }

    return result;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
