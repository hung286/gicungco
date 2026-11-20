// Interactive Pinch-to-Zoom & Pan Overlay for iMath Geometry & Diagrams
// Designed for Mobile Touch & Desktop Browsers
// Author: Thầy Nguyễn Mạnh Hùng - MHEdu

(function(global) {
  class ZoomPanOverlay {
    constructor() {
      this.overlay = null;
      this.img = null;
      this.scale = 1;
      this.minScale = 0.8;
      this.maxScale = 5.0;
      this.posX = 0;
      this.posY = 0;
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.initialDistance = 0;
      this.initialScale = 1;
      this.init();
    }

    init() {
      this.overlay = document.createElement('div');
      this.overlay.id = 'imath-zoom-overlay';
      this.overlay.style.cssText = 'position: fixed; inset: 0; z-index: 99999; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(12px); display: none; flex-direction: column; align-items: center; justify-content: center; touch-action: none; user-select: none;';

      this.overlay.innerHTML = [
        '<div style="position: absolute; top: 16px; left: 16px; right: 16px; display: flex; justify-content: space-between; align-items: center; z-index: 10;">',
        '  <div style="display: flex; align-items: center; gap: 8px; color: white;">',
        '    <span style="font-size: 20px;">📐</span>',
        '    <span style="font-weight: 800; font-size: 15px; color: #fde047;">Thu phóng Sơ đồ iMath</span>',
        '    <span style="font-size: 12px; color: #94a3b8;">(Dùng 2 ngón tay thu phóng / kéo hình)</span>',
        '  </div>',
        '  <div style="display: flex; gap: 8px;">',
        '    <button id="zoom-reset-btn" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px;">↺ Đặt lại</button>',
        '    <button id="zoom-close-btn" style="background: #ef4444; border: none; color: white; padding: 6px 16px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 14px;">✕ Đóng</button>',
        '  </div>',
        '</div>',
        '<div id="zoom-viewport" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: grab;">',
        '  <img id="zoom-target-img" src="" alt="Sơ đồ iMath" style="max-width: 90vw; max-height: 80vh; object-fit: contain; pointer-events: none; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); transform-origin: center center; transition: transform 0.05s linear;" />',
        '</div>',
        '<div style="position: absolute; bottom: 20px; display: flex; gap: 12px; background: rgba(0,0,0,0.5); padding: 8px 16px; border-radius: 999px; backdrop-filter: blur(8px); z-index: 10;">',
        '  <button id="zoom-out-btn" style="background: none; border: none; color: white; font-size: 20px; font-weight: 900; cursor: pointer; padding: 0 8px;">−</button>',
        '  <span id="zoom-level-text" style="color: #fde047; font-weight: 800; font-size: 14px; min-width: 50px; text-align: center; line-height: 28px;">100%</span>',
        '  <button id="zoom-in-btn" style="background: none; border: none; color: white; font-size: 20px; font-weight: 900; cursor: pointer; padding: 0 8px;">+</button>',
        '</div>'
      ].join('');

      document.body.appendChild(this.overlay);

      this.img = this.overlay.querySelector('#zoom-target-img');
      this.viewport = this.overlay.querySelector('#zoom-viewport');
      this.zoomText = this.overlay.querySelector('#zoom-level-text');

      this.bindEvents();
    }

    bindEvents() {
      // Close & Reset
      this.overlay.querySelector('#zoom-close-btn').addEventListener('click', () => this.close());
      this.overlay.querySelector('#zoom-reset-btn').addEventListener('click', () => this.resetTransform());

      this.overlay.querySelector('#zoom-in-btn').addEventListener('click', () => {
        this.scale = Math.min(this.maxScale, this.scale + 0.3);
        this.updateTransform();
      });

      this.overlay.querySelector('#zoom-out-btn').addEventListener('click', () => {
        this.scale = Math.max(this.minScale, this.scale - 0.3);
        this.updateTransform();
      });

      // Mouse Wheel Zoom
      this.viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.2 : -0.2;
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));
        this.updateTransform();
      }, { passive: false });

      // Mouse Drag
      this.viewport.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.startX = e.clientX - this.posX;
        this.startY = e.clientY - this.posY;
        this.viewport.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.posX = e.clientX - this.startX;
        this.posY = e.clientY - this.startY;
        this.updateTransform();
      });

      window.addEventListener('mouseup', () => {
        this.isDragging = false;
        if (this.viewport) this.viewport.style.cursor = 'grab';
      });

      // Mobile Touch Gestures (Pinch & Pan)
      this.viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.isDragging = true;
          this.startX = e.touches[0].clientX - this.posX;
          this.startY = e.touches[0].clientY - this.posY;
        } else if (e.touches.length === 2) {
          this.isDragging = false;
          this.initialDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          this.initialScale = this.scale;
        }
      }, { passive: false });

      this.viewport.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
          this.posX = e.touches[0].clientX - this.startX;
          this.posY = e.touches[0].clientY - this.startY;
          this.updateTransform();
        } else if (e.touches.length === 2) {
          const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (this.initialDistance > 0) {
            const factor = currentDistance / this.initialDistance;
            this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.initialScale * factor));
            this.updateTransform();
          }
        }
      }, { passive: false });

      this.viewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
          this.initialDistance = 0;
        }
        if (e.touches.length === 0) {
          this.isDragging = false;
        }
      });
    }

    open(imageSrc) {
      if (!this.img) return;
      this.img.src = imageSrc;
      this.resetTransform();
      this.overlay.style.display = 'flex';
    }

    close() {
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
    }

    resetTransform() {
      this.scale = 1;
      this.posX = 0;
      this.posY = 0;
      this.updateTransform();
    }

    updateTransform() {
      if (!this.img) return;
      this.img.style.transform = 'translate(' + this.posX + 'px, ' + this.posY + 'px) scale(' + this.scale + ')';
      if (this.zoomText) {
        this.zoomText.textContent = Math.round(this.scale * 100) + '%';
      }
    }
  }

  global.ZoomPanOverlay = new ZoomPanOverlay();
})(typeof window !== 'undefined' ? window : global);
