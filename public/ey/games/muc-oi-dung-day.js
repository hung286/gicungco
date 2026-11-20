// Mực Ơi, Đừng Dậy! (Phiên bản Chạy Rớt Dép · Cổng Trường Chibi) - EY Portal Integration
// Thiết kế cho hệ thống SmartEdu EY - NMH Thầy Nguyễn Mạnh Hùng

(function () {
  window.launchMucOiDungDay = function (arena, options = {}) {
    arena.innerHTML = '';
    arena.style.cssText = 'position: fixed; inset: 0; width: 100vw; height: 100vh; overflow: hidden; background: #edf4e9; z-index: 999999;';

    const iframe = document.createElement('iframe');
    iframe.src = '/ey/games/chay-rot-dep/index.html?v=20261111';
    iframe.title = 'Mực Ơi, Đừng Dậy! - Chạy Rớt Dép Cổng Trường Chibi';
    iframe.allow = 'autoplay; fullscreen';
    iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
    arena.appendChild(iframe);

    const rosterSource = (Array.isArray(options.roster) && options.roster.length >= 2)
      ? options.roster
      : (Array.isArray(window.classRoster) && window.classRoster.length >= 2)
        ? window.classRoster
        : null;

    iframe.addEventListener('load', () => {
      if (rosterSource && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({ type: 'MUC_SET_ROSTER', roster: rosterSource }, '*');
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
        arena.style.cssText = '';
        arena.innerHTML = '';
      }
    }

    function switchToClassic() {
      destroy();
      const launchClassic = () => {
        if (typeof window.launchMucOiDungDayClassic === 'function') {
          const cleanup = window.launchMucOiDungDayClassic(arena, options);
          if (window.__activePickerCleanup !== undefined) window.__activePickerCleanup = cleanup;
          if (window.__activeFullscreenGameCleanup !== undefined) window.__activeFullscreenGameCleanup = cleanup;
        }
      };
      if (typeof window.launchMucOiDungDayClassic === 'function') {
        launchClassic();
      } else {
        const s = document.createElement('script');
        s.src = '/ey/games/muc-oi-dung-day-classic.js?v=20261111_classic';
        s.onload = launchClassic;
        document.head.appendChild(s);
      }
    }

    function onMessage(ev) {
      if (!ev || ev.source !== iframe.contentWindow || !ev.data) return;
      if (ev.data.type === 'MUC_EXIT') {
        exitToLobby();
      } else if (ev.data.type === 'MUC_SWITCH_CLASSIC') {
        switchToClassic();
      } else if (ev.data.type === 'MUC_STUDENT_PICKED') {
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
