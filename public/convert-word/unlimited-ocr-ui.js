(function () {
  const STORAGE_URL_KEY = 'mhedu_unlimited_ocr_url';
  const STORAGE_APIKEY_KEY = 'mhedu_unlimited_ocr_apikey';
  const STORAGE_MD_KEY = 'mhedu_unlimited_ocr_markdown';

  const SAMPLE_EXAM_MD = `# ĐỀ KIỂM TRA GIỮA HỌC KÌ I — MÔN TOÁN 12

**PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.** Thí sinh trả lời từ câu 1 đến câu 2.

Câu 1. Cho hàm số $y = f(x) = x^3 - 3x + 2$. Số điểm cực trị của hàm số đã cho là:
A. $0$
B. $1$
C. $2$
D. $3$

Câu 2. Tính tích phân $I = \\int_0^1 (2x + 1)\\,dx$.
A. $I = 1$
B. $I = 2$
C. $I = 3$
D. $I = 4$

**PHẦN II. Câu trắc nghiệm đúng sai.**

Câu 1. Cho hàm số $y = \\dfrac{2x - 1}{x + 1}$ có đồ thị $(C)$. Xét tính đúng, sai của các khẳng định sau:
a) Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{-1\\}$.
b) Đạo hàm của hàm số là $y' = \\dfrac{3}{(x+1)^2} > 0, \\forall x \\neq -1$.
c) Tiệm cận ngang của đồ thị $(C)$ là đường thẳng $y = 1$.
d) Đồ thị $(C)$ cắt trục tung tại điểm $M(0; -1)$.
`;

  const state = {
    mode: 'unlimited',
    pages: [], // { id, name, dataUrl, selected }
    lastPdfBase64: '',
    lastPdfName: '',
    figures: [], // { id, index, pageNo, type, dataUrl, originalDataUrl, widthPx, heightPx, modeLabel }
    backendUrl: localStorage.getItem(STORAGE_URL_KEY) || 'http://127.0.0.1:8000',
    apiKey: localStorage.getItem(STORAGE_APIKEY_KEY) || '',
    slidingWindow: 128,
    markdown: localStorage.getItem(STORAGE_MD_KEY) || SAMPLE_EXAM_MD,
    fileName: 'De_Toan_MHEdu.docx',
    docTitle: '',
    fontSizePt: 12,
    cropModalPageIdx: -1
  };

  function el(id) {
    return document.getElementById(id);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function getGeminiKeyFromStorage() {
    try {
      const k =
        localStorage.getItem('gemini_api_key') ||
        localStorage.getItem('smartedu_gemini_key') ||
        localStorage.getItem('math_visualizer_api_key') ||
        localStorage.getItem('ocr_typst_key_gemini') ||
        '';
      return k.split(/[\n,;\t]+/)[0].trim();
    } catch {
      return '';
    }
  }

  function renderMarkdownToHtml(md) {
    const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
    let html = '';
    let i = 0;

    function formatInline(text) {
      const mathPlaceholders = [];
      let safe = escapeHtml(text).replace(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g, (m) => {
        const idx = mathPlaceholders.length;
        mathPlaceholders.push(m);
        return `@@MATH_${idx}@@`;
      });
      safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      safe = safe.replace(
        /^((?:Câu|Bài)\s+\d+\s*[.:)]|PHẦN\s+[IVX0-9]+[.:]?|[A-D]\.|[a-d]\))/i,
        '<strong class="text-emerald-800">$1</strong>'
      );
      return safe.replace(/@@MATH_(\d+)@@/g, (_, idx) => mathPlaceholders[Number(idx)]);
    }

    while (i < lines.length) {
      const line = lines[i].trim();
      if (!line) {
        i++;
        continue;
      }

      // Embedded figure preview ![Caption](fig:fig_1)
      const figMatch =
        line.match(/^!\[([^\]]*)\]\(fig:([a-zA-Z0-9_-]+)\)$/) ||
        line.match(/^\[\[HINH_([a-zA-Z0-9_-]+)\]\]$/);
      if (figMatch) {
        const figId = figMatch.length === 3 ? figMatch[2] : figMatch[1];
        const cap = figMatch.length === 3 ? figMatch[1] : '';
        const fig = state.figures.find((f) => f.id === figId);
        if (fig) {
          html += `<div class="my-3 text-center">
            <img src="${fig.dataUrl}" alt="${escapeHtml(cap || figId)}" class="inline-block max-h-60 rounded-lg border border-slate-200 bg-white p-1 shadow-sm" />
            ${cap ? `<div class="text-xs text-slate-500 italic mt-1">${escapeHtml(cap)}</div>` : ''}
          </div>`;
        } else {
          html += `<div class="my-2 text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-1.5">[Chưa tìm thấy hình ${escapeHtml(figId)}]</div>`;
        }
        i++;
        continue;
      }

      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
        html += '<hr class="my-3 border-slate-300" />';
        i++;
        continue;
      }

      // Markdown table
      if (
        line.includes('|') &&
        i + 1 < lines.length &&
        /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(lines[i + 1].trim())
      ) {
        const parseRow = (r) =>
          r
            .trim()
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim());
        const headers = parseRow(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].trim().includes('|')) {
          rows.push(parseRow(lines[i]));
          i++;
        }
        html += '<div class="overflow-x-auto my-3"><table class="w-full border-collapse border border-slate-300 text-sm">';
        html += '<thead><tr class="bg-slate-100">';
        for (const h of headers) {
          html += `<th class="border border-slate-300 px-2 py-1.5 font-semibold text-center">${formatInline(h)}</th>`;
        }
        html += '</tr></thead><tbody>';
        for (const r of rows) {
          html += '<tr>';
          for (let c = 0; c < headers.length; c++) {
            html += `<td class="border border-slate-300 px-2 py-1.5">${formatInline(r[c] || '')}</td>`;
          }
          html += '</tr>';
        }
        html += '</tbody></table></div>';
        continue;
      }

      const hMatch = line.match(/^(#{1,4})\s+(.*)$/);
      if (hMatch) {
        const lvl = hMatch[1].length;
        const cls =
          lvl === 1
            ? 'text-lg font-bold text-center text-slate-900 my-3'
            : lvl === 2
            ? 'text-base font-bold text-slate-800 mt-3 mb-1.5'
            : 'text-sm font-bold text-slate-800 mt-2 mb-1';
        html += `<div class="${cls}">${formatInline(hMatch[2])}</div>`;
        i++;
        continue;
      }

      const isOpt = /^[A-D]\.|^[a-d]\)/.test(line);
      html += `<p class="my-1.5 leading-relaxed ${isOpt ? 'pl-5' : ''}">${formatInline(line)}</p>`;
      i++;
    }
    return html || '<p class="text-slate-400 italic">Chưa có nội dung xem trước...</p>';
  }

  let previewTimer = null;
  function updatePreview() {
    const previewEl = el('uocr-preview');
    if (!previewEl) return;
    previewEl.innerHTML = renderMarkdownToHtml(state.markdown);
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetClear && window.MathJax.typesetClear([previewEl]);
      window.MathJax.typesetPromise([previewEl]).catch(() => {});
    }
  }

  function setStatus(text, type = 'info') {
    const box = el('uocr-status');
    if (!box) return;
    if (!text) {
      box.className = 'hidden';
      box.textContent = '';
      return;
    }
    const palette = {
      info: 'bg-sky-50 border-sky-200 text-sky-800',
      success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      error: 'bg-rose-50 border-rose-200 text-rose-800',
      warn: 'bg-amber-50 border-amber-200 text-amber-800'
    };
    box.className = `rounded-xl border px-3.5 py-2.5 text-sm whitespace-pre-line ${palette[type] || palette.info}`;
    box.textContent = text;
  }

  function renderPages() {
    const grid = el('uocr-pages-grid');
    const countBadge = el('uocr-pages-count');
    if (!grid) return;

    const selectedCount = state.pages.filter((p) => p.selected).length;
    if (countBadge) {
      countBadge.textContent = `${selectedCount}/${state.pages.length} trang đã chọn`;
    }

    if (state.pages.length === 0) {
      grid.innerHTML =
        '<div class="col-span-full text-center py-6 text-slate-400 text-sm">Chưa có trang PDF/ảnh nào. Kéo thả file PDF hoặc ảnh đề thi vào khung phía trên.</div>';
      return;
    }

    grid.innerHTML = state.pages
      .map(
        (p, idx) => `
      <div class="relative rounded-xl border ${
        p.selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 opacity-60'
      } bg-white overflow-hidden transition">
        <div class="cursor-pointer" data-toggle-page="${idx}">
          <img src="${p.dataUrl}" alt="${escapeHtml(p.name)}" class="w-full h-24 object-contain bg-slate-50" />
        </div>
        <div class="px-2 py-1 text-[11px] font-medium text-slate-700 flex items-center justify-between gap-1 bg-white border-t border-slate-100">
          <span class="truncate" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
          <button type="button" data-crop-page="${idx}" class="shrink-0 px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[10px]" title="Khoanh vùng crop hình thủ công trên trang này">
            ✂️ Crop
          </button>
        </div>
      </div>`
      )
      .join('');

    grid.querySelectorAll('[data-toggle-page]').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = Number(card.getAttribute('data-toggle-page'));
        state.pages[idx].selected = !state.pages[idx].selected;
        renderPages();
      });
    });

    grid.querySelectorAll('[data-crop-page]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.getAttribute('data-crop-page'));
        openManualCropModal(idx);
      });
    });
  }

  function renderFigures() {
    const grid = el('uocr-figures-grid');
    const badge = el('uocr-figures-count');
    if (badge) badge.textContent = `${state.figures.length} hình đã tách`;
    if (!grid) return;

    if (state.figures.length === 0) {
      grid.innerHTML =
        '<div class="col-span-full text-center py-5 text-slate-400 text-xs">Chưa có hình vẽ nào. Bấm <b>"✂️ Tự động tách &amp; Crop hình PDF"</b> hoặc bấm nút <b>✂️ Crop</b> trên từng trang để khoanh vùng hình.</div>';
      return;
    }

    grid.innerHTML = state.figures
      .map(
        (f, idx) => `
      <div class="rounded-xl border border-slate-200 bg-white p-2.5 flex flex-col gap-2 shadow-sm">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-bold text-slate-800">Hình ${f.index} <span class="font-normal text-slate-400">(Tr.${f.pageNo || 1} • ${f.type === 'vector' ? 'Vector' : f.type === 'manual' ? 'Crop tay' : 'Ảnh'})</span></span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
            f.modeLabel === 'AI vẽ lại'
              ? 'bg-indigo-100 text-indigo-700'
              : f.modeLabel === 'Đã làm nét'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }">${escapeHtml(f.modeLabel || 'Gốc')}</span>
        </div>
        <div class="h-32 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden p-1">
          <img src="${f.dataUrl}" alt="${escapeHtml(f.id)}" class="max-h-full max-w-full object-contain" />
        </div>
        <div class="grid grid-cols-2 gap-1.5 text-[11px]">
          <button type="button" data-fig-clean="${idx}" class="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold">
            ✨ Làm nét trắng đen
          </button>
          <button type="button" data-fig-redraw="${idx}" class="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold">
            🔄 Chạy lại hình AI
          </button>
          <button type="button" data-fig-insert="${idx}" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold">
            + Chèn vào bài
          </button>
          <div class="flex gap-1">
            <button type="button" data-fig-revert="${idx}" class="flex-1 px-1.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold" title="Khôi phục ảnh gốc">
              ↩ Gốc
            </button>
            <button type="button" data-fig-del="${idx}" class="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold" title="Xóa hình">
              ✕
            </button>
          </div>
        </div>
      </div>`
      )
      .join('');

    grid.querySelectorAll('[data-fig-clean]').forEach((b) =>
      b.addEventListener('click', () => cleanFigureInk(Number(b.getAttribute('data-fig-clean'))))
    );
    grid.querySelectorAll('[data-fig-redraw]').forEach((b) =>
      b.addEventListener('click', () => redrawFigureWithAI(Number(b.getAttribute('data-fig-redraw'))))
    );
    grid.querySelectorAll('[data-fig-insert]').forEach((b) =>
      b.addEventListener('click', () => {
        const f = state.figures[Number(b.getAttribute('data-fig-insert'))];
        if (f) insertSnippet(`\n![Hình ${f.index}](fig:${f.id})\n`);
      })
    );
    grid.querySelectorAll('[data-fig-revert]').forEach((b) =>
      b.addEventListener('click', () => {
        const f = state.figures[Number(b.getAttribute('data-fig-revert'))];
        if (f && f.originalDataUrl) {
          f.dataUrl = f.originalDataUrl;
          f.modeLabel = 'Gốc';
          renderFigures();
          updatePreview();
        }
      })
    );
    grid.querySelectorAll('[data-fig-del]').forEach((b) =>
      b.addEventListener('click', () => {
        state.figures.splice(Number(b.getAttribute('data-fig-del')), 1);
        renderFigures();
        updatePreview();
      })
    );
  }

  // Instant offline white-background / crisp-ink cleanup for scanned figures
  async function cleanFigureInk(idx) {
    const fig = state.figures[idx];
    if (!fig) return;
    const img = await loadImage(fig.originalDataUrl || fig.dataUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      // Push light gray background to pure white, darken ink lines cleanly
      let v;
      if (lum > 215) v = 255;
      else if (lum < 85) v = 0;
      else v = Math.round(((lum - 85) / (215 - 85)) * 255);
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    fig.dataUrl = canvas.toDataURL('image/png');
    fig.widthPx = canvas.width;
    fig.heightPx = canvas.height;
    fig.modeLabel = 'Đã làm nét';
    renderFigures();
    updatePreview();
    setStatus(`✨ Đã làm nét nền trắng chữ đen cho Hình ${fig.index}!`, 'success');
  }

  // Re-draw cropped figure into crisp vector SVG -> PNG via existing /api/visualize engine
  async function redrawFigureWithAI(idx) {
    const fig = state.figures[idx];
    if (!fig) return;
    const customDesc = window.prompt(
      `Mô tả ngắn cho Hình ${fig.index} để AI vẽ lại sắc nét hơn (có thể để trống để AI tự nhìn ảnh vẽ lại):`,
      ''
    );
    if (customDesc === null) return;

    setStatus(`🔄 Đang chạy lại Hình ${fig.index} bằng AI Vector (/api/visualize)...`, 'info');
    try {
      const base64Only = (fig.originalDataUrl || fig.dataUrl).split(',')[1] || '';
      const resp = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText:
            customDesc.trim() ||
            'Vẽ lại chính xác hình vẽ toán học/đồ thị/hình học trong ảnh đính kèm theo phong cách đề thi THPT Việt Nam, nét mảnh đen sắc nét trên nền trắng, đúng nhãn đỉnh và số liệu.',
          image: { base64: base64Only, mimeType: 'image/png' },
          isGrayscale: true,
          apiKey: getGeminiKeyFromStorage() || undefined
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data?.svgCode) {
        throw new Error(data?.error || 'AI không trả về được mã hình SVG.');
      }

      const png = await svgStringToPngDataUrl(data.svgCode);
      fig.dataUrl = png.dataUrl;
      fig.widthPx = png.width;
      fig.heightPx = png.height;
      // Preserve exact 1:1 physical width of original figure, adjusting height by SVG aspect ratio
      if (fig.wordWidthPx && png.width > 0 && png.height > 0) {
        fig.wordHeightPx = Math.max(24, Math.round(fig.wordWidthPx * (png.height / png.width)));
      }
      fig.modeLabel = 'AI vẽ lại';
      renderFigures();
      updatePreview();
      setStatus(`✅ Đã chạy lại Hình ${fig.index} thành hình vector sắc nét!`, 'success');
    } catch (err) {
      setStatus(`❌ Lỗi chạy lại hình AI: ${err.message}`, 'error');
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function svgStringToPngDataUrl(svgStr) {
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    try {
      const img = await loadImage(url);
      const scale = 2;
      const w = Math.max(240, img.naturalWidth || 480);
      const h = Math.max(180, img.naturalHeight || 340);
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, w, h);
      return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function autoExtractPdfFigures() {
    if (!state.lastPdfBase64) {
      setStatus('Vui lòng tải lên 1 file PDF trước để dùng tự động tách & crop hình (hoặc bấm nút ✂️ Crop trên từng ảnh).', 'warn');
      return;
    }
    const btn = el('uocr-extract-figs-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Đang tự động quét & crop hình (Raster + Vector)...';
    }
    setStatus('Đang phân tích PDF bằng PyMuPDF (quét cả ảnh nhúng lẫn hình vẽ vector đồ thị/hình học)...', 'info');

    try {
      const resp = await fetch('/api/pdf-extract-figures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: state.lastPdfBase64 })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Không tách được hình từ PDF.');
      }
      const extracted = Array.isArray(data.figures) ? data.figures : [];
      let nextIdx = state.figures.length + 1;
      for (const f of extracted) {
        state.figures.push({
          id: `fig_${nextIdx}`,
          index: nextIdx,
          pageNo: f.pageNo || 1,
          type: f.type || 'raster',
          dataUrl: f.dataUrl,
          originalDataUrl: f.dataUrl,
          widthPx: f.widthPx || 360,
          heightPx: f.heightPx || 240,
          wordWidthPx: f.wordWidthPx || Math.round(((f.widthPx || 360) / 3.0) * (96 / 72)),
          wordHeightPx: f.wordHeightPx || Math.round(((f.heightPx || 240) / 3.0) * (96 / 72)),
          modeLabel: 'Gốc'
        });
        nextIdx++;
      }
      renderFigures();
      if (extracted.length > 0) {
        setStatus(`✅ Đã tự động tách & crop gọn ${extracted.length} hình từ PDF! Bạn có thể bấm "Làm nét", "Chạy lại hình AI", hoặc "+ Chèn vào bài".`, 'success');
      } else {
        setStatus('Không phát hiện hình vẽ tự động trong PDF này. Bạn có thể bấm nút "✂️ Crop" trên từng trang để khoanh vùng thủ công.', 'warn');
      }
    } catch (err) {
      setStatus(`❌ Lỗi tách hình PDF: ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✂️ Tự động tách & Crop hình PDF';
      }
    }
  }

  // Manual Crop Modal
  function openManualCropModal(pageIdx) {
    const page = state.pages[pageIdx];
    if (!page) return;
    state.cropModalPageIdx = pageIdx;

    const modal = el('uocr-crop-modal');
    const canvas = el('uocr-crop-canvas');
    if (!modal || !canvas) return;
    modal.classList.remove('hidden');

    loadImage(page.dataUrl).then((img) => {
      const maxDisplayW = Math.min(820, window.innerWidth - 64);
      const scale = Math.min(1, maxDisplayW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');

      let dragging = false;
      let sx = 0, sy = 0, ex = 0, ey = 0;

      const redraw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        if (Math.abs(ex - sx) > 4 && Math.abs(ey - sy) > 4) {
          const rx = Math.min(sx, ex);
          const ry = Math.min(sy, ey);
          const rw = Math.abs(ex - sx);
          const rh = Math.abs(ey - sy);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2;
          ctx.strokeRect(rx, ry, rw, rh);
        }
      };
      redraw();

      const getPos = (evt) => {
        const rect = canvas.getBoundingClientRect();
        return {
          x: ((evt.clientX - rect.left) / rect.width) * canvas.width,
          y: ((evt.clientY - rect.top) / rect.height) * canvas.height
        };
      };

      canvas.onmousedown = (evt) => {
        const p = getPos(evt);
        dragging = true;
        sx = ex = p.x;
        sy = ey = p.y;
        redraw();
      };
      canvas.onmousemove = (evt) => {
        if (!dragging) return;
        const p = getPos(evt);
        ex = p.x;
        ey = p.y;
        redraw();
      };
      window.onmouseup = () => {
        dragging = false;
      };

      el('uocr-crop-confirm').onclick = () => {
        const rx = Math.min(sx, ex);
        const ry = Math.min(sy, ey);
        const rw = Math.abs(ex - sx);
        const rh = Math.abs(ey - sy);
        if (rw < 12 || rh < 12) {
          alert('Hãy kéo chuột khoanh 1 vùng hình chữ nhật trước khi bấm Lưu hình crop!');
          return;
        }
        const origX = Math.round(rx / scale);
        const origY = Math.round(ry / scale);
        const origW = Math.round(rw / scale);
        const origH = Math.round(rh / scale);

        const outCanvas = document.createElement('canvas');
        outCanvas.width = origW;
        outCanvas.height = origH;
        const octx = outCanvas.getContext('2d');
        octx.fillStyle = '#ffffff';
        octx.fillRect(0, 0, origW, origH);
        octx.drawImage(img, origX, origY, origW, origH, 0, 0, origW, origH);

        const dataUrl = outCanvas.toDataURL('image/png');
        const nextIdx = state.figures.length + 1;
        // PDF pages are rendered at scale=2.0 (2.0 px per PDF pt); convert to exact 1:1 Word 96-DPI px
        const isPdfPage = page.name.includes('(Trang ');
        const wordW = isPdfPage ? Math.round((origW / 2.0) * (96 / 72)) : origW;
        const wordH = isPdfPage ? Math.round((origH / 2.0) * (96 / 72)) : origH;
        state.figures.push({
          id: `fig_${nextIdx}`,
          index: nextIdx,
          pageNo: pageIdx + 1,
          type: 'manual',
          dataUrl,
          originalDataUrl: dataUrl,
          widthPx: origW,
          heightPx: origH,
          wordWidthPx: wordW,
          wordHeightPx: wordH,
          modeLabel: 'Gốc'
        });
        renderFigures();
        modal.classList.add('hidden');
        setStatus(`✂️ Đã crop thủ công Hình ${nextIdx} (${origW}×${origH}px)!`, 'success');
      };
    });
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setStatus(`Đang xử lý ${files.length} tệp đầu vào...`, 'info');

    for (const file of files) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        if (!window.pdfjsLib) {
          setStatus('Không tải được thư viện pdf.js để đọc PDF.', 'error');
          continue;
        }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const arrayBuf = await file.arrayBuffer();

        // Save base64 PDF for PyMuPDF figure extraction
        const bytes = new Uint8Array(arrayBuf);
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        state.lastPdfBase64 = btoa(binary);
        state.lastPdfName = file.name;

        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuf }).promise;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          state.pages.push({
            id: `${file.name}-${pageNum}-${Date.now()}`,
            name: `${file.name} (Trang ${pageNum})`,
            dataUrl: canvas.toDataURL('image/png'),
            selected: true
          });
        }
        if (state.fileName === 'De_Toan_MHEdu.docx') {
          state.fileName = file.name.replace(/\.pdf$/i, '') + '.docx';
          if (el('uocr-filename')) el('uocr-filename').value = state.fileName;
        }
      } else if (file.type.startsWith('image/')) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        state.pages.push({
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          dataUrl,
          selected: true
        });
      }
    }

    renderPages();
    setStatus(
      `Đã tải ${state.pages.length} trang. Bạn có thể bấm "🚀 Chạy Unlimited-OCR" và/hoặc "✂️ Tự động tách & Crop hình PDF"!`,
      'success'
    );
  }

  async function checkBackendHealth() {
    const url = (el('uocr-url')?.value || '').trim();
    const apiKey = (el('uocr-apikey')?.value || '').trim();
    state.backendUrl = url;
    state.apiKey = apiKey;
    localStorage.setItem(STORAGE_URL_KEY, url);
    localStorage.setItem(STORAGE_APIKEY_KEY, apiKey);

    setStatus(`Đang kiểm tra kết nối backend Unlimited-OCR tại ${url}...`, 'info');
    try {
      const resp = await fetch('/api/unlimited-ocr/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backendUrl: url, apiKey })
      });
      const data = await resp.json();
      if (data.ok) {
        const gpu = data?.info?.gpu_name ? ` • GPU: ${data.info.gpu_name}` : '';
        setStatus(`✅ Kết nối thành công (${data.protocol}) tại ${data.backendUrl}${gpu}`, 'success');
      } else {
        setStatus(`⚠️ ${data.error || 'Không kết nối được backend.'}`, 'warn');
      }
    } catch (err) {
      setStatus(`❌ Lỗi kiểm tra kết nối: ${err.message}`, 'error');
    }
  }

  async function runUnlimitedOcr() {
    const selected = state.pages.filter((p) => p.selected);
    if (selected.length === 0) {
      setStatus('Vui lòng tải lên ít nhất 1 trang PDF hoặc ảnh trước khi chạy OCR.', 'warn');
      return;
    }

    const url = (el('uocr-url')?.value || '').trim();
    const apiKey = (el('uocr-apikey')?.value || '').trim();
    const slidingWindow = Number(el('uocr-window')?.value) || 128;
    state.backendUrl = url;
    state.apiKey = apiKey;
    state.slidingWindow = slidingWindow;
    localStorage.setItem(STORAGE_URL_KEY, url);
    localStorage.setItem(STORAGE_APIKEY_KEY, apiKey);

    const btn = el('uocr-run-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = `⏳ Đang OCR ${selected.length} trang bằng Unlimited-OCR...`;
    }
    setStatus(
      `Đang gửi ${selected.length} trang tới Unlimited-OCR (${url}, R-SWA window=${slidingWindow})...`,
      'info'
    );

    try {
      const resp = await fetch('/api/unlimited-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: selected.map((p) => p.dataUrl),
          backendUrl: url,
          apiKey,
          slidingWindow
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }

      state.markdown = data.markdown || '';
      localStorage.setItem(STORAGE_MD_KEY, state.markdown);
      if (el('uocr-md')) el('uocr-md').value = state.markdown;
      updatePreview();
      setStatus(
        `✅ Unlimited-OCR hoàn tất ${data.pagesProcessed} trang (${data.protocol}). Bạn có thể chèn hình đã crop và bấm "Tải file Word (.docx)"!`,
        'success'
      );
    } catch (err) {
      setStatus(`❌ Lỗi Unlimited-OCR:\n${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '🚀 Chạy Unlimited-OCR (One-Shot R-SWA)';
      }
    }
  }

  async function downloadDocx() {
    const md = (el('uocr-md')?.value || '').trim();
    if (!md) {
      setStatus('Chưa có nội dung Markdown để xuất file Word.', 'warn');
      return;
    }

    const fileName = (el('uocr-filename')?.value || 'De_Toan_MHEdu.docx').trim();
    const title = (el('uocr-doctitle')?.value || '').trim();
    const fontSizePt = Number(el('uocr-fontsize')?.value) || 12;

    const btn = el('uocr-docx-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Đang tạo file .docx...';
    }
    setStatus('Đang chuyển đổi Markdown + LaTeX + Hình ảnh sang Word (.docx)...', 'info');

    try {
      const resp = await fetch('/api/unlimited-ocr/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: md,
          title,
          fileName,
          fontName: 'Times New Roman',
          fontSizePt,
          figures: state.figures.map((f) => ({
            id: f.id,
            dataUrl: f.dataUrl,
            widthPx: f.widthPx,
            heightPx: f.heightPx,
            wordWidthPx: f.wordWidthPx,
            wordHeightPx: f.wordHeightPx
          }))
        })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${resp.status}`);
      }
      const blob = await resp.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);
      setStatus(
        `✅ Đã tải về "${a.download}" (đã tự chia cột A/B/C/D và nhúng hình vẽ)! Mở trong Word và bấm "Toggle TeX" (MH2026) để đổi $...$ sang MathType/Equation.`,
        'success'
      );
    } catch (err) {
      setStatus(`❌ Lỗi xuất file Word (.docx): ${err.message}`, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '📥 Tải file Word (.docx)';
      }
    }
  }

  function insertSnippet(snippet) {
    const ta = el('uocr-md');
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    ta.value = ta.value.slice(0, start) + snippet + ta.value.slice(end);
    state.markdown = ta.value;
    localStorage.setItem(STORAGE_MD_KEY, state.markdown);
    ta.focus();
    updatePreview();
  }

  function switchMode(mode) {
    state.mode = mode;
    const uocrPanel = el('uocr-studio');
    const legacyRoot = el('root');
    const tabUocr = el('tab-btn-uocr');
    const tabGemini = el('tab-btn-gemini');

    if (mode === 'unlimited') {
      uocrPanel.classList.remove('hidden');
      legacyRoot.classList.add('hidden');
      tabUocr.className =
        'px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-sm transition';
      tabGemini.className =
        'px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition';
    } else {
      uocrPanel.classList.add('hidden');
      legacyRoot.classList.remove('hidden');
      tabGemini.className =
        'px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-sm transition';
      tabUocr.className =
        'px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition';
    }
  }

  function mountUI() {
    const host = el('uocr-studio');
    if (!host) return;

    host.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 py-5 space-y-5 pb-16">
        <!-- Header Banner -->
        <div class="rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full mb-2">
              <span>⚡ Baidu Unlimited-OCR</span>
              <span>•</span>
              <span>✂️ Auto/Manual Crop</span>
              <span>•</span>
              <span>🔄 Chạy lại hình AI</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight">
              Trợ lý AI Soạn Toán Markdown → DOCX &amp; Unlimited-OCR
            </h1>
            <p class="text-emerald-100 text-xs sm:text-sm mt-1">
              Giữ nguyên cơ chế của hệ thống MHEdu, nâng cấp OCR nhiều trang (R-SWA), tự động tách &amp; crop hình vector/raster 300 DPI, chạy lại hình AI sắc nét và xuất Word (.docx).
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button id="uocr-guide-toggle" type="button" class="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold backdrop-blur transition">
              📖 Hướng dẫn chạy Backend
            </button>
          </div>
        </div>

        <!-- Collapsible Backend Guide -->
        <div id="uocr-guide-box" class="hidden rounded-2xl border border-slate-200 bg-slate-900 text-slate-100 p-4 text-xs space-y-2.5 shadow">
          <div class="font-bold text-emerald-400 text-sm">Cách chạy Backend Baidu Unlimited-OCR (Local GPU ≥ 8GB VRAM hoặc Google Colab T4 miễn phí):</div>
          <div>
            <span class="text-slate-400">Cách 1 (Khuyên dùng — vLLM OpenAI-compatible):</span>
            <pre class="mt-1 bg-black/50 p-2.5 rounded-lg overflow-x-auto text-emerald-300">vllm serve baidu/Unlimited-OCR --trust-remote-code --logits_processors vllm.model_executor.models.unlimited_ocr:NGramPerReqLogitsProcessor --no-enable-prefix-caching --mm-processor-cache-gb 0 --port 8000</pre>
          </div>
          <div>
            <span class="text-slate-400">Cách 2 (Python FastAPI có sẵn trong repo):</span>
            <pre class="mt-1 bg-black/50 p-2.5 rounded-lg overflow-x-auto text-sky-300">pip install fastapi uvicorn torch transformers pillow accelerate
python scripts/unlimited_ocr_server.py --port 8000</pre>
          </div>
        </div>

        <!-- Status Box -->
        <div id="uocr-status" class="hidden"></div>

        <!-- Step 1 & 2: Backend Config + PDF/Image Upload -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div class="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div class="font-bold text-slate-800 text-sm flex items-center justify-between">
              <span>1. Kết nối Backend Unlimited-OCR</span>
              <span class="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">vLLM / FastAPI</span>
            </div>
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-slate-600">URL Server Unlimited-OCR</label>
              <div class="flex gap-2">
                <input id="uocr-url" type="text" value="${escapeHtml(state.backendUrl)}" placeholder="http://127.0.0.1:8000"
                  class="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button id="uocr-health-btn" type="button" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold whitespace-nowrap">
                  Kiểm tra
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">API Key (tùy chọn)</label>
                <input id="uocr-apikey" type="password" value="${escapeHtml(state.apiKey)}" placeholder="Bearer token..."
                  class="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Sliding Window (R-SWA)</label>
                <input id="uocr-window" type="number" min="32" max="1024" value="${state.slidingWindow}"
                  class="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          <div class="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 text-sm">2. Tải đề PDF nhiều trang hoặc Ảnh</span>
              <div class="flex items-center gap-2">
                <span id="uocr-pages-count" class="text-xs text-slate-500 font-medium">0/0 trang đã chọn</span>
                <button id="uocr-clear-pages" type="button" class="text-xs text-rose-600 hover:underline font-semibold">Xóa tất cả</button>
              </div>
            </div>

            <label id="uocr-dropzone" class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 py-3.5 px-3 cursor-pointer transition">
              <div class="text-sm font-semibold text-emerald-800">📄 Kéo thả hoặc bấm để chọn file PDF / Ảnh (.pdf, .png, .jpg)</div>
              <div class="text-xs text-slate-500 mt-0.5">Hỗ trợ nhiều trang PDF • Tự động nhận diện công thức Toán &amp; tách hình vẽ</div>
              <input id="uocr-file-input" type="file" accept=".pdf,image/*" multiple class="hidden" />
            </label>

            <div id="uocr-pages-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-44 overflow-y-auto pr-1"></div>

            <div class="flex flex-wrap justify-end gap-2">
              <button id="uocr-extract-figs-btn" type="button" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-sm transition">
                ✂️ Tự động tách &amp; Crop hình PDF
              </button>
              <button id="uocr-run-btn" type="button" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition">
                🚀 Chạy Unlimited-OCR (One-Shot R-SWA)
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2B: Cropped Figures & AI Re-draw Gallery -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="font-bold text-slate-800 text-sm">✂️ Kho hình đã Crop &amp; Chạy lại hình (Làm nét / Vẽ lại Vector AI)</h2>
              <p class="text-xs text-slate-500">Tự cắt sạch viền trắng ở 300 DPI. Bấm <b>Làm nét</b> (tức thì), <b>Chạy lại hình AI</b> (vẽ lại sắc nét bằng mathVisualizerEngine), rồi bấm <b>+ Chèn vào bài</b> để nhúng vào file Word.</p>
            </div>
            <span id="uocr-figures-count" class="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">0 hình đã tách</span>
          </div>
          <div id="uocr-figures-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"></div>
        </div>

        <!-- Step 3: Trợ lý AI Soạn Toán Markdown -> DOCX -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 class="font-bold text-slate-800 text-base">3. Trợ lý AI Soạn Toán Markdown → DOCX</h2>
              <p class="text-xs text-slate-500">Chỉnh sửa kết quả OCR hoặc soạn trực tiếp Markdown + LaTeX + Hình đã crop và xuất Word (.docx).</p>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" data-snippet="sample" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">📋 Mẫu đề THPT</button>
              <button type="button" data-snippet="mcq" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">+ Câu ABCD</button>
              <button type="button" data-snippet="tf" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">+ Câu Đúng/Sai</button>
              <button type="button" data-snippet="math" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700">+ Công thức $$</button>
              <button id="uocr-copy-btn" type="button" class="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-xs font-semibold text-sky-700">Copy MD</button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-xs font-semibold text-slate-600 mb-1.5">Mã nguồn Markdown + LaTeX</label>
              <textarea id="uocr-md" rows="16"
                class="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                placeholder="Dán hoặc soạn nội dung Markdown + LaTeX tại đây..."></textarea>
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-semibold text-slate-600 mb-1.5">Xem trước trực tiếp (MathJax + Hình vẽ)</label>
              <div id="uocr-preview" class="flex-1 min-h-[360px] max-h-[520px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-800"></div>
            </div>
          </div>

          <!-- Export Bar -->
          <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1">
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Tên file tải về (.docx)</label>
                <input id="uocr-filename" type="text" value="${escapeHtml(state.fileName)}"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Tiêu đề đầu trang (tùy chọn)</label>
                <input id="uocr-doctitle" type="text" value="${escapeHtml(state.docTitle)}" placeholder="VD: ĐỀ KIỂM TRA TOÁN 12"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Cỡ chữ (Times New Roman)</label>
                <select id="uocr-fontsize" class="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white">
                  <option value="11">11 pt</option>
                  <option value="12" selected>12 pt (Chuẩn)</option>
                  <option value="13">13 pt</option>
                </select>
              </div>
            </div>
            <button id="uocr-docx-btn" type="button" class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition whitespace-nowrap">
              📥 Tải file Word (.docx)
            </button>
          </div>
        </div>
      </div>

      <!-- Manual Crop Modal -->
      <div id="uocr-crop-modal" class="hidden fixed inset-0 z-[100000] bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div class="font-bold text-slate-800 text-sm">✂️ Khoanh chuột chọn vùng hình cần Crop</div>
            <button id="uocr-crop-close" type="button" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700">Đóng</button>
          </div>
          <div class="p-4 overflow-auto flex-1 bg-slate-100 flex justify-center">
            <canvas id="uocr-crop-canvas" class="cursor-crosshair bg-white shadow border border-slate-300"></canvas>
          </div>
          <div class="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
            <span class="text-xs text-slate-500">Kéo giữ chuột trái để vẽ khung hình chữ nhật quanh đồ thị / hình vẽ.</span>
            <button id="uocr-crop-confirm" type="button" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
              ✅ Lưu hình vừa Crop
            </button>
          </div>
        </div>
      </div>
    `;

    el('uocr-md').value = state.markdown;
    renderPages();
    renderFigures();
    updatePreview();

    el('tab-btn-uocr')?.addEventListener('click', () => switchMode('unlimited'));
    el('tab-btn-gemini')?.addEventListener('click', () => switchMode('gemini'));
    el('uocr-guide-toggle')?.addEventListener('click', () => {
      el('uocr-guide-box')?.classList.toggle('hidden');
    });
    el('uocr-health-btn')?.addEventListener('click', checkBackendHealth);
    el('uocr-run-btn')?.addEventListener('click', runUnlimitedOcr);
    el('uocr-extract-figs-btn')?.addEventListener('click', autoExtractPdfFigures);
    el('uocr-docx-btn')?.addEventListener('click', downloadDocx);
    el('uocr-crop-close')?.addEventListener('click', () => {
      el('uocr-crop-modal')?.classList.add('hidden');
    });
    el('uocr-clear-pages')?.addEventListener('click', () => {
      state.pages = [];
      state.lastPdfBase64 = '';
      renderPages();
      setStatus('', 'info');
    });

    el('uocr-file-input')?.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });

    const dz = el('uocr-dropzone');
    if (dz) {
      dz.addEventListener('dragover', (e) => {
        e.preventDefault();
        dz.classList.add('bg-emerald-100');
      });
      dz.addEventListener('dragleave', () => dz.classList.remove('bg-emerald-100'));
      dz.addEventListener('drop', (e) => {
        e.preventDefault();
        dz.classList.remove('bg-emerald-100');
        handleFiles(e.dataTransfer.files);
      });
    }

    el('uocr-md')?.addEventListener('input', (e) => {
      state.markdown = e.target.value;
      localStorage.setItem(STORAGE_MD_KEY, state.markdown);
      clearTimeout(previewTimer);
      previewTimer = setTimeout(updatePreview, 180);
    });

    el('uocr-copy-btn')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(state.markdown);
        setStatus('✅ Đã copy nội dung Markdown vào clipboard!', 'success');
      } catch {
        setStatus('Không copy được tự động, hãy bôi đen và nhấn Ctrl+C.', 'warn');
      }
    });

    host.querySelectorAll('[data-snippet]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-snippet');
        if (type === 'sample') {
          state.markdown = SAMPLE_EXAM_MD;
          el('uocr-md').value = SAMPLE_EXAM_MD;
          localStorage.setItem(STORAGE_MD_KEY, SAMPLE_EXAM_MD);
          updatePreview();
        } else if (type === 'mcq') {
          insertSnippet(
            '\n\nCâu 3. Tìm nghiệm của phương trình $2x - 4 = 0$.\nA. $x = 1$\nB. $x = 2$\nC. $x = 3$\nD. $x = 4$\n'
          );
        } else if (type === 'tf') {
          insertSnippet(
            '\n\nCâu 2. Xét tính đúng sai của các mệnh đề sau:\na) Mệnh đề 1...\nb) Mệnh đề 2...\nc) Mệnh đề 3...\nd) Mệnh đề 4...\n'
          );
        } else if (type === 'math') {
          insertSnippet('\n$$\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$$\n');
        }
      });
    });

    switchMode('unlimited');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountUI);
  } else {
    mountUI();
  }
})();
