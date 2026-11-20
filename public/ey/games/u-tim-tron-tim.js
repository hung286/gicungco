// Ú Tim - Trốn Tìm (Cổng Trường Chibi · Người Canh Quay Lại Rượt Bắt) - EY Portal Integration
// Thiết kế cho hệ thống SmartEdu EY - NMH Thầy Nguyễn Mạnh Hùng

(function () {
  window.launchUTimTronTim = function (arena, options = {}) {
    arena.innerHTML = '';
    const isArenaModal = arena.id === 'game-arena-content';
    const prevArenaStyle = arena.getAttribute('style') || '';
    arena.style.cssText = 'position: fixed; inset: 0; width: 100vw; height: 100vh; overflow: hidden; background: #fff4ec; z-index: 999999;';

    const iframe = document.createElement('iframe');
    iframe.src = '/ey/games/u-tim-tron-tim/index.html?v=20261111';
    iframe.title = 'Ú Tim - Trốn Tìm · Trò chơi Gọi Tên Ngẫu Nhiên';
    iframe.allow = 'autoplay; fullscreen';
    iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
    arena.appendChild(iframe);

    const rosterSource = (Array.isArray(options.roster) && options.roster.length >= 2)
      ? options.roster
      : (Array.isArray(window.classRoster) && window.classRoster.length >= 2)
        ? window.classRoster
        : null;

    const genderSource = (options.gioiTinh && typeof options.gioiTinh === 'object')
      ? options.gioiTinh
      : (window.classGenders && typeof window.classGenders === 'object')
        ? window.classGenders
        : {};

    const className = options.className || '';

    iframe.addEventListener('load', () => {
      if (iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({
            type: 'UTIM_SET_SESSION',
            roster: rosterSource || [],
            gioiTinh: genderSource,
            className
          }, '*');
        } catch {}
      }
    });

    function exitToLobby() {
      destroy();
      if (typeof options.onExit === 'function') {
        options.onExit();
      } else {
        const modal = document.getElementById('game-modal');
        if (modal) modal.classList.remove('open');
        if (isArenaModal) {
          arena.style.cssText = prevArenaStyle;
        } else {
          arena.style.cssText = '';
        }
        arena.innerHTML = '';
      }
    }

    function onMessage(ev) {
      if (!ev || ev.source !== iframe.contentWindow || !ev.data) return;
      if (ev.data.type === 'UTIM_EXIT') {
        exitToLobby();
      } else if (ev.data.type === 'UTIM_STUDENT_PICKED') {
        if (typeof options.onStudentPicked === 'function') {
          options.onStudentPicked(ev.data.student);
        } else if (typeof options.onPick === 'function') {
          options.onPick(ev.data.student);
        }
      }
    }

    window.addEventListener('message', onMessage);

    function destroy() {
      window.removeEventListener('message', onMessage);
      try {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      } catch {}
    }

    return destroy;
  };
})();
