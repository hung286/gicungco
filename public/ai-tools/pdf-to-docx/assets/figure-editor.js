/**
 * Figure Editor & Interactive Bounding Box Resizer for PDF Sang Word v2.0
 * Cho phép giáo viên:
 * 1. Kéo thả (Drag) di chuyển vùng cắt hình bị lệch.
 * 2. Kéo 8 tay nắm (Resize) co dãn khung hình to/nhỏ để không bị chém mất chữ, mất mốc cực trị hay nan quạt.
 * 3. Nút ✂️ "Cắt lại hình này" để quét lại vùng mới đè lên đúng vị trí của hình cũ.
 * 4. Nút "✂️ Cắt thêm hình" thuận tiện, dễ thao tác.
 */

(function () {
  'use strict';

  // Inject CSS cho các tay nắm resize và nút hành động
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .pw-bbox {
      cursor: move !important;
      user-select: none !important;
      touch-action: none !important;
      transition: box-shadow 0.15s ease, border-color 0.15s ease !important;
    }
    .pw-bbox:hover, .pw-bbox.is-active {
      box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      border-color: #047857 !important;
    }
    .pw-bbox-tag {
      cursor: default !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 3px !important;
      padding: 2px 6px !important;
      border-radius: 4px 4px 0 0 !important;
      pointer-events: auto !important;
    }
    .pw-bbox-recrop-btn {
      background: rgba(255, 255, 255, 0.28) !important;
      border: none !important;
      color: #ffffff !important;
      width: 17px !important;
      height: 17px !important;
      border-radius: 3px !important;
      cursor: pointer !important;
      font-size: 10px !important;
      display: inline-grid !important;
      place-items: center !important;
      line-height: 1 !important;
      padding: 0 !important;
      transition: background 0.15s ease, transform 0.1s ease !important;
    }
    .pw-bbox-recrop-btn:hover {
      background: #0284c7 !important;
      transform: scale(1.15) !important;
    }
    .pw-bbox-del {
      transition: background 0.15s ease, transform 0.1s ease !important;
    }
    .pw-bbox-del:hover {
      background: #ef4444 !important;
      transform: scale(1.15) !important;
    }
    /* 8 tay nắm co dãn khung hình */
    .pw-bbox-handle {
      position: absolute !important;
      width: 10px !important;
      height: 10px !important;
      background: #ffffff !important;
      border: 2px solid #0d9488 !important;
      border-radius: 2px !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35) !important;
      z-index: 12 !important;
      box-sizing: border-box !important;
      pointer-events: auto !important;
    }
    .pw-bbox-handle:hover {
      background: #0d9488 !important;
      transform: scale(1.25) !important;
    }
    .pw-h-nw { top: -5px !important; left: -5px !important; cursor: nwse-resize !important; }
    .pw-h-ne { top: -5px !right: -5px !important; right: -5px !important; cursor: nesw-resize !important; }
    .pw-h-se { bottom: -5px !important; right: -5px !important; cursor: nwse-resize !important; }
    .pw-h-sw { bottom: -5px !important; left: -5px !important; cursor: nesw-resize !important; }
    .pw-h-n  { top: -5px !important; left: calc(50% - 5px) !important; cursor: ns-resize !important; }
    .pw-h-s  { bottom: -5px !important; left: calc(50% - 5px) !important; cursor: ns-resize !important; }
    .pw-h-w  { top: calc(50% - 5px) !important; left: -5px !important; cursor: ew-resize !important; }
    .pw-h-e  { top: calc(50% - 5px) !important; right: -5px !important; cursor: ew-resize !important; }

    /* Thanh hướng dẫn sửa hình nổi trên trang PDF */
    .pw-editor-tip-bar {
      margin-top: 6px;
      padding: 6px 12px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      font-size: 0.78rem;
      color: #166534;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .pw-editor-tip-bar.is-recropping {
      background: #eff6ff;
      border-color: #bfdbfe;
      color: #1e40af;
      font-weight: 600;
    }
    .pw-editor-cancel-btn {
      background: #ef4444;
      color: #fff;
      border: none;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      cursor: pointer;
    }
  `;
  document.head.appendChild(styleEl);

  let recropTargetFigureId = null; // Nếu đang ở chế độ cắt lại 1 hình cụ thể

  // Chờ ứng dụng sẵn sàng
  function waitForApp(callback, maxTries = 40) {
    if (window.__PW_APP && window.__PW_APP.state) {
      callback(window.__PW_APP);
    } else if (maxTries > 0) {
      setTimeout(() => waitForApp(callback, maxTries - 1), 100);
    }
  }

  waitForApp((app) => {
    console.log('🚀 Đã kích hoạt Module Chỉnh sửa & Cắt lại Bounding Box (Figure Editor)!');

    const overlayLayer = document.getElementById('bboxOverlayLayer');
    const btnToggleDraw = document.getElementById('btnToggleDrawBbox');

    // Nâng cấp nhãn nút "Khoanh thêm hình" thành "✂️ Cắt thêm hình"
    if (btnToggleDraw) {
      btnToggleDraw.innerHTML = '✂️ Cắt thêm hình';
      btnToggleDraw.title = 'Khoanh cắt thêm vùng hình/đồ thị mới trên trang PDF này';
    }

    // Thêm thanh hướng dẫn dưới stage toolbar
    const stageToolbar = document.querySelector('.pw-stage-toolbar');
    let tipBar = null;
    if (stageToolbar && stageToolbar.parentElement) {
      tipBar = document.createElement('div');
      tipBar.className = 'pw-editor-tip-bar';
      tipBar.innerHTML = `
        <span>💡 <strong>Chỉnh sửa hình ảnh:</strong> Kéo các góc/cạnh để co dãn vùng cắt, kéo thân hình để di chuyển, hoặc bấm ✂️ trên nhãn để cắt lại.</span>
      `;
      stageToolbar.parentElement.insertBefore(tipBar, stageToolbar.nextSibling);
    }

    // Hàm gắn các handle resize và nút sửa vào từng khung .pw-bbox
    function enhanceBboxElements() {
      if (!overlayLayer) return;
      const bboxes = overlayLayer.querySelectorAll('.pw-bbox');
      const page = app.state.pages[app.state.currentPageIdx];
      if (!page || !page.figures) return;

      bboxes.forEach((bboxEl) => {
        // Tránh gắn trùng lặp
        if (bboxEl.dataset.enhanced === '1') return;
        bboxEl.dataset.enhanced = '1';

        const figIdx = Number(bboxEl.dataset.figIdx);
        const fig = page.figures[figIdx];
        if (!fig) return;

        // Thêm nút Cắt lại ✂️ vào nhãn .pw-bbox-tag
        const tag = bboxEl.querySelector('.pw-bbox-tag');
        if (tag && !tag.querySelector('.pw-bbox-recrop-btn')) {
          const recropBtn = document.createElement('button');
          recropBtn.type = 'button';
          recropBtn.className = 'pw-bbox-recrop-btn';
          recropBtn.innerHTML = '✂️';
          recropBtn.title = `Khoanh cắt lại cho ${fig.id}`;
          recropBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
          recropBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startRecropForFigure(fig.id);
          });
          const delBtn = tag.querySelector('[data-del-fig]');
          if (delBtn) {
            tag.insertBefore(recropBtn, delBtn);
          } else {
            tag.appendChild(recropBtn);
          }
        }

        // Thêm 8 tay nắm co dãn
        const handles = ['nw', 'ne', 'se', 'sw', 'n', 's', 'w', 'e'];
        handles.forEach((dir) => {
          const h = document.createElement('div');
          h.className = `pw-bbox-handle pw-h-${dir}`;
          h.dataset.handle = dir;
          bboxEl.appendChild(h);
        });

        // Thiết lập sự kiện kéo thả (Drag) và co dãn (Resize)
        setupInteractiveTransform(bboxEl, figIdx);
      });
    }

    // Logic Kéo thả và Co dãn khung hình
    function setupInteractiveTransform(bboxEl, figIdx) {
      bboxEl.addEventListener('pointerdown', (e) => {
        // Nếu click vào nút tag hoặc đang vẽ hình mới thì bỏ qua
        if (e.target.closest('.pw-bbox-tag') || app.state.isDrawingBbox) return;

        e.stopPropagation();
        e.preventDefault();

        const page = app.state.pages[app.state.currentPageIdx];
        if (!page || !page.figures || !page.figures[figIdx]) return;
        const fig = page.figures[figIdx];

        const layerRect = overlayLayer.getBoundingClientRect();
        if (layerRect.width <= 0 || layerRect.height <= 0) return;

        bboxEl.classList.add('is-active');
        const handleType = e.target.dataset.handle || null;
        const isResize = !!handleType;

        const startPointerX = e.clientX;
        const startPointerY = e.clientY;
        const origBox = [...fig.box]; // [ymin, xmin, ymax, xmax] trên thang 0..1000

        // Capture pointer
        bboxEl.setPointerCapture(e.pointerId);

        const onPointerMove = (moveEvt) => {
          const deltaX = ((moveEvt.clientX - startPointerX) / layerRect.width) * 1000;
          const deltaY = ((moveEvt.clientY - startPointerY) / layerRect.height) * 1000;

          let [y1, x1, y2, x2] = origBox;

          if (!isResize) {
            // Chế độ Drag Move toàn bộ khung
            const w = x2 - x1;
            const h = y2 - y1;
            x1 = Math.max(0, Math.min(1000 - w, Math.round(origBox[1] + deltaX)));
            y1 = Math.max(0, Math.min(1000 - h, Math.round(origBox[0] + deltaY)));
            x2 = x1 + w;
            y2 = y1 + h;
          } else {
            // Chế độ Resize theo từng tay nắm
            const minDim = 25; // Chiều rộng/cao tối thiểu
            if (handleType.includes('w')) {
              x1 = Math.max(0, Math.min(origBox[3] - minDim, Math.round(origBox[1] + deltaX)));
            }
            if (handleType.includes('e')) {
              x2 = Math.min(1000, Math.max(origBox[1] + minDim, Math.round(origBox[3] + deltaX)));
            }
            if (handleType.includes('n')) {
              y1 = Math.max(0, Math.min(origBox[2] - minDim, Math.round(origBox[0] + deltaY)));
            }
            if (handleType.includes('s')) {
              y2 = Math.min(1000, Math.max(origBox[0] + minDim, Math.round(origBox[2] + deltaY)));
            }
          }

          // Cập nhật vị trí style hiển thị tức thì trên DOM
          bboxEl.style.top = (y1 / 10).toFixed(2) + '%';
          bboxEl.style.left = (x1 / 10).toFixed(2) + '%';
          bboxEl.style.width = ((x2 - x1) / 10).toFixed(2) + '%';
          bboxEl.style.height = ((y2 - y1) / 10).toFixed(2) + '%';
        };

        const onPointerUp = async (upEvt) => {
          bboxEl.removeEventListener('pointermove', onPointerMove);
          bboxEl.removeEventListener('pointerup', onPointerUp);
          bboxEl.removeEventListener('pointercancel', onPointerUp);
          bboxEl.classList.remove('is-active');

          try {
            bboxEl.releasePointerCapture(upEvt.pointerId);
          } catch {}

          const deltaX = ((upEvt.clientX - startPointerX) / layerRect.width) * 1000;
          const deltaY = ((upEvt.clientY - startPointerY) / layerRect.height) * 1000;

          // Nếu chỉ là cú click nhẹ không kéo thì không làm gì
          if (Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3) return;

          let [y1, x1, y2, x2] = origBox;
          if (!isResize) {
            const w = x2 - x1;
            const h = y2 - y1;
            x1 = Math.max(0, Math.min(1000 - w, Math.round(origBox[1] + deltaX)));
            y1 = Math.max(0, Math.min(1000 - h, Math.round(origBox[0] + deltaY)));
            x2 = x1 + w;
            y2 = y1 + h;
          } else {
            const minDim = 25;
            if (handleType.includes('w')) x1 = Math.max(0, Math.min(origBox[3] - minDim, Math.round(origBox[1] + deltaX)));
            if (handleType.includes('e')) x2 = Math.min(1000, Math.max(origBox[1] + minDim, Math.round(origBox[3] + deltaX)));
            if (handleType.includes('n')) y1 = Math.max(0, Math.min(origBox[2] - minDim, Math.round(origBox[0] + deltaY)));
            if (handleType.includes('s')) y2 = Math.min(1000, Math.max(origBox[0] + minDim, Math.round(origBox[2] + deltaY)));
          }

          // Cập nhật tọa độ mới vào figure
          fig.box = [y1, x1, y2, x2];
          fig.manual = true; // Đánh dấu thủ công để giữ nguyên vị trí giáo viên căn chỉnh
          delete fig.dataUrl; // Xóa cache cũ
          delete fig.cropped;

          // Cắt lại hình ngay lập tức và render lại Word Preview
          if (typeof app.cropPage === 'function') {
            await app.cropPage(page, false);
          }
          if (typeof app.renderOverlay === 'function') app.renderOverlay();
          if (typeof app.renderGallery === 'function') app.renderGallery();
          if (typeof app.renderPreview === 'function') app.renderPreview();

          if (typeof app.toast === 'function') {
            app.toast(isResize ? `✂️ Đã sửa kích thước vùng ${fig.id}` : `✂️ Đã di chuyển vùng ${fig.id}`, 'ok');
          }
        };

        bboxEl.addEventListener('pointermove', onPointerMove);
        bboxEl.addEventListener('pointerup', onPointerUp);
        bboxEl.addEventListener('pointercancel', onPointerUp);
      });
    }

    // Kích hoạt chế độ Cắt lại một hình cụ thể (Recrop Target)
    function startRecropForFigure(figId) {
      recropTargetFigureId = figId;
      app.state.isDrawingBbox = true;
      if (overlayLayer) {
        overlayLayer.classList.add('is-drawing');
      }
      if (tipBar) {
        tipBar.classList.add('is-recropping');
        tipBar.innerHTML = `
          <span>🎯 <strong>Đang cắt lại cho ${figId}:</strong> Hãy kéo chuột trên trang để khoanh lại vùng chính xác...</span>
          <button type="button" class="pw-editor-cancel-btn" id="btnCancelRecrop">✕ Hủy</button>
        `;
        document.getElementById('btnCancelRecrop')?.addEventListener('click', cancelRecropMode);
      }
      if (typeof app.toast === 'function') {
        app.toast(`🎯 Hãy kéo chuột khoanh lại vùng cho ${figId}`, 'info');
      }
    }

    function cancelRecropMode() {
      recropTargetFigureId = null;
      app.state.isDrawingBbox = false;
      if (overlayLayer) overlayLayer.classList.remove('is-drawing');
      if (tipBar) {
        tipBar.classList.remove('is-recropping');
        tipBar.innerHTML = `
          <span>💡 <strong>Chỉnh sửa hình ảnh:</strong> Kéo các góc/cạnh để co dãn vùng cắt, kéo thân hình để di chuyển, hoặc bấm ✂️ trên nhãn để cắt lại.</span>
        `;
      }
    }

    // Can thiệp khi người dùng vẽ xong vùng mới (nếu đang ở chế độ recrop cho figId)
    overlayLayer?.addEventListener('pointerup', async () => {
      if (!recropTargetFigureId) return;

      // Đợi sự kiện gốc của app chạy xong để lấy hình mới vừa thêm (thường được thêm vào cuối figures)
      setTimeout(async () => {
        const page = app.state.pages[app.state.currentPageIdx];
        if (!page || !page.figures) return;

        const targetFig = page.figures.find((f) => f.id === recropTargetFigureId);
        const lastFig = page.figures[page.figures.length - 1];

        if (targetFig && lastFig && lastFig !== targetFig) {
          // Gán tọa độ mới của lastFig đè lên targetFig
          targetFig.box = [...lastFig.box];
          targetFig.manual = true;
          delete targetFig.dataUrl;
          delete targetFig.cropped;

          // Xóa lastFig thừa vừa sinh ra
          page.figures.pop();
          // Xóa thẻ [[HINH_moi]] thừa trong markdown
          if (page.markdown) {
            page.markdown = page.markdown.replace(new RegExp(`\\[\\[${lastFig.id}\\]\\]\\s*`, 'g'), '');
            const mdTextarea = document.getElementById('markdownTextarea');
            if (mdTextarea) mdTextarea.value = page.markdown;
          }

          // Cắt lại ảnh cho targetFig
          await app.cropPage(page, false);
          app.renderOverlay();
          app.renderGallery();
          app.renderPreview();
          if (typeof app.toast === 'function') {
            app.toast(`✅ Đã cắt lại thành công cho ${targetFig.id}!`, 'ok');
          }
        }
        cancelRecropMode();
      }, 50);
    }, true);

    // Lắng nghe MutationObserver trên overlayLayer để tự động gắn handles mỗi khi app render lại overlay
    const observer = new MutationObserver(() => {
      enhanceBboxElements();
    });
    if (overlayLayer) {
      observer.observe(overlayLayer, { childList: true });
    }

    // Chạy lần đầu
    enhanceBboxElements();
  });
})();
