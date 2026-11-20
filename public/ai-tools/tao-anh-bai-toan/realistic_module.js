/**
 * realistic_module.js
 * Module độc lập: Quản lý giao diện Hình Thực Tế AI (2 Lớp Dual-Layer) & Bộ lọc In Đề Thi THPT
 * Hoàn toàn không sửa đổi, không phá vỡ bất kỳ luồng xử lý TikZ hay SVG cũ nào.
 */

window.RealisticModule = (function () {
  let currentBackgroundImg = null;
  let currentSvgOverlay = null;
  let currentExamPrintSvg = null;

  /**
   * Khởi tạo giao diện container 2 lớp
   */
  function initContainer() {
    const mainWrap = document.getElementById('svg-view-wrap');
    if (!mainWrap) return;

    // Kiểm tra nếu container 2 lớp chưa tồn tại thì tạo mới
    let dualContainer = document.getElementById('dual-layer-container');
    if (!dualContainer) {
      dualContainer = document.createElement('div');
      dualContainer.id = 'dual-layer-container';
      dualContainer.className = 'hidden relative w-full max-w-[860px] aspect-[860/540] rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 select-none';
      dualContainer.innerHTML = `
        <!-- Lớp 1: Ảnh bối cảnh thực tế (Background Layer) -->
        <img id="dual-layer-bg" src="" alt="Realistic Background" class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300" />
        
        <!-- Lớp phủ làm dịu ánh sáng nhẹ để nét toán học luôn nổi bật 100% -->
        <div class="absolute inset-0 bg-white/10 backdrop-brightness-105 pointer-events-none"></div>

        <!-- Lớp 2: Lớp phủ Vector SVG Toán học chuẩn xác (Mathematical Overlay) -->
        <div id="dual-layer-svg" class="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-auto"></div>

        <!-- Watermark / Nhãn kiểm định Sư phạm GDPT -->
        <div class="absolute bottom-2 right-3 px-2 py-0.5 rounded bg-slate-900/60 backdrop-blur-xs text-[10px] text-white/80 font-mono pointer-events-none flex items-center gap-1">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Khóa Tọa Độ 2.5D Chuẩn Xác</span>
        </div>
      `;
      mainWrap.parentElement.appendChild(dualContainer);
    }

    // Container cho bản in đề thi đen trắng
    let examContainer = document.getElementById('exam-print-container');
    if (!examContainer) {
      examContainer = document.createElement('div');
      examContainer.id = 'exam-print-container';
      examContainer.className = 'hidden w-full max-w-[860px] aspect-[860/540] p-4 bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden';
      examContainer.innerHTML = `
        <div id="exam-print-content" class="w-full h-full flex items-center justify-center"></div>
      `;
      mainWrap.parentElement.appendChild(examContainer);
    }
  }

  /**
   * Cập nhật dữ liệu vào container 2 lớp
   */
  function updateData(bgDataUrl, svgOverlay, examPrintSvg) {
    initContainer();
    currentBackgroundImg = bgDataUrl || null;
    currentSvgOverlay = svgOverlay || '';
    currentExamPrintSvg = examPrintSvg || svgOverlay || '';

    const bgImgEl = document.getElementById('dual-layer-bg');
    const svgWrapEl = document.getElementById('dual-layer-svg');
    const examWrapEl = document.getElementById('exam-print-content');

    if (bgImgEl) {
      if (bgDataUrl) {
        bgImgEl.src = bgDataUrl;
        bgImgEl.style.display = 'block';
      } else {
        // Fallback nền gradient sạch nếu không có ảnh AI
        bgImgEl.style.display = 'none';
      }
    }

    if (svgWrapEl && svgOverlay) {
      svgWrapEl.innerHTML = svgOverlay;
      // Đảm bảo SVG co dãn chuẩn 100%
      const svg = svgWrapEl.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.backgroundColor = 'transparent';
      }
    }

    if (examWrapEl && currentExamPrintSvg) {
      examWrapEl.innerHTML = currentExamPrintSvg;
      const svg = examWrapEl.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
      }
    }
  }

  /**
   * Chuyển tab hiển thị sang chế độ Hình Thực Tế AI (2 Lớp)
   */
  function showRealisticTab() {
    initContainer();
    const svgWrap = document.getElementById('svg-view-wrap');
    const tikzWrap = document.getElementById('tikz-view-wrap');
    const dualContainer = document.getElementById('dual-layer-container');
    const examContainer = document.getElementById('exam-print-container');

    if (svgWrap) svgWrap.classList.add('hidden');
    if (tikzWrap) tikzWrap.classList.add('hidden');
    if (examContainer) examContainer.classList.add('hidden');
    if (dualContainer) dualContainer.classList.remove('hidden');

    // Cập nhật trạng thái nút tab
    document.querySelectorAll('[data-view-tab]').forEach(btn => {
      btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm');
      btn.classList.add('text-slate-600');
    });
    const activeBtn = document.getElementById('tab-dual-realistic');
    if (activeBtn) {
      activeBtn.classList.add('bg-white', 'text-amber-600', 'shadow-sm');
    }
  }

  /**
   * Chuyển tab sang chế độ Bản In Đề Thi Đen Trắng
   */
  function showExamPrintTab() {
    initContainer();
    const svgWrap = document.getElementById('svg-view-wrap');
    const tikzWrap = document.getElementById('tikz-view-wrap');
    const dualContainer = document.getElementById('dual-layer-container');
    const examContainer = document.getElementById('exam-print-container');

    if (svgWrap) svgWrap.classList.add('hidden');
    if (tikzWrap) tikzWrap.classList.add('hidden');
    if (dualContainer) dualContainer.classList.add('hidden');
    if (examContainer) examContainer.classList.remove('hidden');

    document.querySelectorAll('[data-view-tab]').forEach(btn => {
      btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm');
      btn.classList.add('text-slate-600');
    });
    const activeBtn = document.getElementById('tab-exam-print');
    if (activeBtn) {
      activeBtn.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
    }
  }

  /**
   * Gộp 2 lớp (Lớp 1 ảnh bối cảnh + Lớp 2 vector) thành 1 ảnh PNG độ nét cao (2K)
   */
  async function exportMergedPng(scale = 2) {
    if (!currentSvgOverlay) {
      alert('Chưa có dữ liệu hình ảnh để xuất.');
      return;
    }

    const width = 860 * scale;
    const height = 540 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Vẽ nền trắng mặc định
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 2. Nếu có ảnh bối cảnh thực tế Lớp 1: Vẽ lên canvas
    if (currentBackgroundImg) {
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          // Vẽ lớp phủ dịu nhẹ
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(0, 0, width, height);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = currentBackgroundImg;
      });
    }

    // 3. Vẽ Lớp 2 Vector SVG đè khít lên tọa độ
    await new Promise((resolve) => {
      const svgBlob = new Blob([currentSvgOverlay], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const svgImg = new Image();
      svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve();
      };
      svgImg.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      svgImg.src = url;
    });

    // 4. Tải file về máy
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Hinh_Thuc_Te_2Lop_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Tải bản in đề thi đen trắng sắc nét
   */
  async function exportExamPrintPng(scale = 2) {
    const svgCode = currentExamPrintSvg || currentSvgOverlay;
    if (!svgCode) {
      alert('Chưa có mã SVG để xuất bản in.');
      return;
    }

    const width = 860 * scale;
    const height = 540 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    await new Promise((resolve) => {
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `De_Thi_Print_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Gọi API tạo hình thực tế độc lập (/api/realistic-image)
   */
  async function callRealisticImageApi(problemText, base64Image, subject, apiKey) {
    const res = await fetch('/api/realistic-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemText,
        image: base64Image ? { base64: base64Image } : null,
        apiKey,
        subject
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Máy chủ trả về HTTP ${res.status}: ${text.slice(0, 150)}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Không thể tạo hình thực tế.');
    }

    return data;
  }

  return {
    initContainer,
    updateData,
    showRealisticTab,
    showExamPrintTab,
    exportMergedPng,
    exportExamPrintPng,
    callRealisticImageApi
  };
})();
