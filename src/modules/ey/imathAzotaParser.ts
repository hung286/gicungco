// ============================================================================
// KHỐI 1B: BỘ XỬ LÝ IMPORT FILE NÂNG CAO (CHUẨN iMATH & AZOTA)
// Hỗ trợ .docx, .xlsx, bóc tách ảnh tự động, MathType OLE TeX và render công thức Toán KaTeX
// Tuân thủ chuẩn đề thi GDPT 2018 / iMath THPT 2025 (Phần I, Phần II, Phần III)
// Tác giả: Thầy Hùng - Trường THPT Số 1 Lê Hồng Phong (0965908084)
// ============================================================================

import type { Question } from './schema';

export class ImathAzotaParser {
  /**
   * Phân tích file Word (.docx) chuẩn iMath hoặc Azota (ủy quyền sang window.FileParser đã chuẩn hóa)
   */
  public static async parseDocx(fileOrBlob: Blob | File): Promise<Question[]> {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && win.FileParser && typeof win.FileParser.parseDocx === 'function') {
      return win.FileParser.parseDocx(fileOrBlob);
    }
    throw new Error('Module FileParser chưa được nạp!');
  }

  /**
   * Phân tích văn bản thô hoặc file CSV/Excel dạng text
   */
  public static parseTextOrCsv(content: string): Question[] {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && win.FileParser && typeof win.FileParser.parseTextOrCsv === 'function') {
      return win.FileParser.parseTextOrCsv(content);
    }
    return [];
  }

  /**
   * Chuyển đổi sang định dạng game đối kháng
   */
  public static toGameQuestions(rawQuestions: any[]): any[] {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && win.FileParser && typeof win.FileParser.toGameQuestions === 'function') {
      return win.FileParser.toGameQuestions(rawQuestions);
    }
    return [];
  }

  /**
   * Tự động render công thức KaTeX trong một DOM element
   */
  public static renderMath(element: HTMLElement | null): void {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && win.FileParser && typeof win.FileParser.renderMath === 'function') {
      win.FileParser.renderMath(element);
    }
  }

  public static formatMath(text: string): string {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && win.FileParser && typeof win.FileParser.formatMath === 'function') {
      return win.FileParser.formatMath(text);
    }
    return text || '';
  }
}
