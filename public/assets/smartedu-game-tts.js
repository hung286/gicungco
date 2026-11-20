/**
 * SmartEdu Universal Game AI Voice (Giọng Đọc AI cho Toàn Bộ Trò Chơi)
 * Hỗ trợ trích xuất câu hỏi cả KaTeX/MathJax (đọc tự nhiên từ TeX annotation),
 * phát qua /api/tts (Google Neural AI miễn phí) và fallback window.speechSynthesis.
 */
(function () {
  'use strict';

  if (window.__SMARTEDU_GAME_TTS_LOADED__) return;
  window.__SMARTEDU_GAME_TTS_LOADED__ = true;

  const CONFIG_KEY = 'smartedu_tts_config';
  const NON_GAME_PREFIXES = [
    '/dashboard',
    '/ai-tools',
    '/tien-ich-giao-duc',
    '/paste-ai',
    '/admin',
    '/login',
    '/register',
    '/pricing',
    '/profile',
    '/question-bank'
  ];

  let activeAudio = null;
  let activeObjUrl = null;
  let activeAbort = null;
  let isSpeakingState = false;
  let lastAutoReadText = '';
  let lastAutoReadAt = 0;
  let widgetCollapsed = false;

  function getConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        engine: parsed.engine || 'ai-server',
        lang: parsed.lang || 'vi',
        rate: Number(parsed.rate) || 0.98,
        enabledInGames: parsed.enabledInGames !== false,
        autoRead: !!parsed.autoRead,
        cleanMath: parsed.cleanMath !== false
      };
    } catch {
      return { engine: 'ai-server', lang: 'vi', rate: 0.98, enabledInGames: true, autoRead: false, cleanMath: true };
    }
  }

  function saveConfig(patch) {
    try {
      const next = { ...getConfig(), ...patch };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
      return next;
    } catch {
      return getConfig();
    }
  }

  function cleanMathForSpeech(raw) {
    if (!raw) return '';
    return String(raw)
      .replace(/\[color=[^\]]*\]([\s\S]*?)\[\/color\]/gi, '$1')
      .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '$1')
      .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '$1')
      .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '$1')
      .replace(/\\dfrac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '$1 phần $2')
      .replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '$1 phần $2')
      .replace(/\^\s*\{([^}]+)\}/g, ' mũ $1')
      .replace(/\^\s*([0-9a-zA-Z]+)/g, ' mũ $1')
      .replace(/_\s*\{([^}]+)\}/g, ' $1')
      .replace(/_\s*([0-9])/g, ' $1')
      .replace(/\\sqrt\s*\{([^}]+)\}/g, 'căn bậc hai của $1')
      .replace(/\\times|\\cdot/g, ' nhân ')
      .replace(/\\div/g, ' chia ')
      .replace(/\\pm/g, ' cộng trừ ')
      .replace(/\\mp/g, ' trừ cộng ')
      .replace(/\\leq|\\le/g, ' nhỏ hơn hoặc bằng ')
      .replace(/\\geq|\\ge/g, ' lớn hơn hoặc bằng ')
      .replace(/\\neq|\\ne/g, ' khác ')
      .replace(/\\approx/g, ' xấp xỉ ')
      .replace(/\\Leftrightarrow/g, ' tương đương ')
      .replace(/\\Rightarrow|\\rightarrow/g, ' suy ra ')
      .replace(/\\infty/g, ' vô cực ')
      .replace(/\\pi/g, ' pi ')
      .replace(/\\alpha/g, ' an-pha ')
      .replace(/\\beta/g, ' bê-ta ')
      .replace(/\\theta/g, ' thê-ta ')
      .replace(/\\Delta/g, ' đen-ta ')
      .replace(/\\sum/g, ' tổng ')
      .replace(/\\int/g, ' tích phân ')
      .replace(/\\lim/g, ' giới hạn ')
      .replace(/\\log/g, ' lô-ga-rit ')
      .replace(/\\sin/g, ' sin ')
      .replace(/\\cos/g, ' cos ')
      .replace(/\\tan/g, ' tan ')
      .replace(/π/g, ' pi ')
      .replace(/∞/g, ' vô cực ')
      .replace(/≤/g, ' nhỏ hơn hoặc bằng ')
      .replace(/≥/g, ' lớn hơn hoặc bằng ')
      .replace(/≠/g, ' khác ')
      .replace(/√/g, ' căn ')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
      .replace(/\$([^$]*)\$/g, '$1')
      .replace(/\\text\s*\{([^}]+)\}/g, '$1')
      .replace(/\\mathrm\s*\{([^}]+)\}/g, '$1')
      .replace(/\\mathbf\s*\{([^}]+)\}/g, '$1')
      .replace(/\\left|\\right/g, '')
      .replace(/\\[a-zA-Z]+/g, ' ')
      .replace(/[{}\\]/g, '')
      .replace(/[−–]/g, ' trừ ')
      .replace(/\s+-\s+/g, ' trừ ')
      .replace(/\s*\+\s*/g, ' cộng ')
      .replace(/\s*=\s*/g, ' bằng ')
      .replace(/\s*<\s*/g, ' nhỏ hơn ')
      .replace(/\s*>\s*/g, ' lớn hơn ')
      .replace(/÷/g, ' chia ')
      .replace(/[×·]/g, ' nhân ')
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
      .replace(/[*_#`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function updateWidgetUi() {
    const bar = document.getElementById('smartedu-game-tts-bar');
    if (!bar) return;
    const playBtn = bar.querySelector('[data-tts-play]');
    const autoBtn = bar.querySelector('[data-tts-auto]');
    const cfg = getConfig();
    if (playBtn) {
      playBtn.innerHTML = isSpeakingState ? '⏹️ <span>Dừng</span>' : '🔊 <span>Đọc câu hỏi</span>';
      playBtn.style.background = isSpeakingState
        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
        : 'linear-gradient(135deg, #6366f1, #7c3aed)';
    }
    if (autoBtn) {
      autoBtn.textContent = cfg.autoRead ? '⚡ Tự đọc: BẬT' : '⚡ Tự đọc';
      autoBtn.style.background = cfg.autoRead ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.12)';
      autoBtn.style.borderColor = cfg.autoRead ? '#34d399' : 'rgba(255, 255, 255, 0.2)';
    }
  }

  function cleanupAudioOnly() {
    if (activeAbort) {
      try { activeAbort.abort(); } catch {}
      activeAbort = null;
    }
    if (activeAudio) {
      try { activeAudio.pause(); activeAudio.currentTime = 0; } catch {}
      activeAudio = null;
    }
    if (activeObjUrl) {
      try { URL.revokeObjectURL(activeObjUrl); } catch {}
      activeObjUrl = null;
    }
  }

  function stop() {
    cleanupAudioOnly();
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch {}
    isSpeakingState = false;
    updateWidgetUi();
  }

  function speakWithBrowser(cleanedText, lang, rate) {
    if (!window.speechSynthesis) return false;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(cleanedText);
      const voices = window.speechSynthesis.getVoices() || [];
      const targetLang = lang === 'en' ? 'en' : 'vi';
      const voice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang)) || (targetLang === 'en' ? voices.find(v => v.lang.toLowerCase().startsWith('en')) : null);
      u.lang = targetLang === 'en' ? 'en-US' : 'vi-VN';
      u.rate = rate || 0.98;
      u.volume = 0.95;
      if (voice) u.voice = voice;
      u.onstart = () => { isSpeakingState = true; updateWidgetUi(); };
      u.onend = () => { isSpeakingState = false; updateWidgetUi(); };
      u.onerror = () => { isSpeakingState = false; updateWidgetUi(); };
      window.speechSynthesis.speak(u);
      isSpeakingState = true;
      updateWidgetUi();
      return true;
    } catch {
      isSpeakingState = false;
      updateWidgetUi();
      return false;
    }
  }

  function speak(rawText, opts = {}) {
    const cfg = getConfig();
    const cleaned = cfg.cleanMath ? cleanMathForSpeech(rawText) : String(rawText || '').trim();
    if (!cleaned || cleaned.length < 2) return false;

    stop();

    const lang = opts.lang || cfg.lang || 'vi';
    const rate = opts.rate || cfg.rate || 0.98;
    if (cfg.engine === 'browser') {
      return speakWithBrowser(cleaned, lang, rate);
    }

    const ctrl = new AbortController();
    activeAbort = ctrl;
    isSpeakingState = true;
    updateWidgetUi();

    fetch(`/api/tts?text=${encodeURIComponent(cleaned)}&lang=${encodeURIComponent(lang)}&slow=${rate <= 0.8 ? '1' : '0'}`, { signal: ctrl.signal })
      .then(res => {
        if (!res.ok) throw new Error('TTS HTTP ' + res.status);
        return res.blob();
      })
      .then(blob => {
        if (ctrl.signal.aborted) return;
        activeObjUrl = URL.createObjectURL(blob);
        const audio = new Audio(activeObjUrl);
        audio.playbackRate = rate;
        audio.volume = 0.95;
        activeAudio = audio;
        audio.onended = () => stop();
        audio.onerror = () => {
          cleanupAudioOnly();
          if (!speakWithBrowser(cleaned, lang, rate)) stop();
        };
        return audio.play().catch(() => {
          cleanupAudioOnly();
          if (!speakWithBrowser(cleaned, lang, rate)) stop();
        });
      })
      .catch(err => {
        if (err && err.name === 'AbortError') return;
        cleanupAudioOnly();
        if (!speakWithBrowser(cleaned, lang, rate)) stop();
      });

    return true;
  }

  function isElementVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    const style = window.getComputedStyle(el);
    if (!style || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    if (el.closest('#smartedu-game-tts-bar, #smartedu-exit-widget, .imath-zoom-bar, .gh-btn-group, nav, header')) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 10 && rect.height > 10;
  }

  // Đọc text từ DOM nhưng thay thẻ KaTeX bằng annotation LaTeX chuẩn xác
  function readElementWithMath(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.imath-zoom-bar, button, script, style, svg, .gh-btn-group').forEach(n => n.remove());
    clone.querySelectorAll('.katex').forEach(k => {
      const ann = k.querySelector('annotation[encoding="application/x-tex"]');
      if (ann && ann.textContent) {
        const span = document.createElement('span');
        span.textContent = ' $' + ann.textContent.trim() + '$ ';
        k.replaceWith(span);
      } else {
        const kmath = k.querySelector('.katex-mathml');
        if (kmath) kmath.remove();
      }
    });
    clone.querySelectorAll('mjx-container').forEach(m => {
      const aria = m.getAttribute('aria-label');
      if (aria) {
        const span = document.createElement('span');
        span.textContent = ' ' + aria + ' ';
        m.replaceWith(span);
      }
    });
    return (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
  }

  const QUESTION_SELECTORS = [
    '#modal-question-text',
    '#questionContent',
    '#question-content',
    '#question-prompt-text',
    '#host-q-text',
    '#math-question',
    '#question-text',
    '#question-box',
    '#t1-qtext',
    '#t2-qtext',
    '.zd-question-text',
    '.tw-question-text',
    '.quiz-question-text',
    '[data-testid="question-stem"]',
    '.imath-zoom-target',
    '.MuiDialog-paper .katex-container',
    '.MuiDialog-paper h5',
    '.MuiDialog-paper h6'
  ];

  function extractVisibleQuestionText() {
    for (const sel of QUESTION_SELECTORS) {
      const nodes = document.querySelectorAll(sel);
      for (const el of nodes) {
        if (!isElementVisible(el)) continue;
        const txt = readElementWithMath(el);
        if (txt && txt.length >= 4) return txt;
      }
    }

    // Fallback: tìm khối có thuộc tính class chứa "question" đang hiển thị ở vùng nội dung chính
    const candidates = document.querySelectorAll('[class*="question"], [id*="question"]');
    let best = '';
    for (const el of candidates) {
      if (!isElementVisible(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.height > window.innerHeight * 0.72) continue;
      const txt = readElementWithMath(el);
      if (txt && txt.length >= 6 && txt.length <= 500) {
        if (txt.length > best.length) best = txt;
      }
    }
    return best;
  }

  function readCurrentQuestion() {
    if (isSpeakingState) {
      stop();
      return;
    }
    const q = extractVisibleQuestionText();
    if (q) {
      speak(q);
    } else {
      speak('Hiện chưa có câu hỏi hiển thị trên màn hình để đọc.');
    }
  }

  function isGameContext() {
    const path = window.location.pathname || '/';
    const search = new URLSearchParams(window.location.search || '');
    const gameParam = search.get('game') || search.get('route') || '';

    if (path.startsWith('/games/')) return true;
    if (path.includes('runner.html')) {
      if (!gameParam) return false;
      const normalized = gameParam.startsWith('/') ? gameParam : '/' + gameParam;
      return !NON_GAME_PREFIXES.some(p => normalized === p || normalized.startsWith(p + '/'));
    }
    return !NON_GAME_PREFIXES.some(p => path === p || path.startsWith(p + '/')) && path !== '/';
  }

  function ensureWidget() {
    const cfg = getConfig();
    const existing = document.getElementById('smartedu-game-tts-bar');
    if (!cfg.enabledInGames || !isGameContext()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const bar = document.createElement('div');
    bar.id = 'smartedu-game-tts-bar';
    bar.style.cssText = [
      'position:fixed',
      'bottom:14px',
      'left:14px',
      'z-index:99990',
      'display:inline-flex',
      'align-items:center',
      'gap:6px',
      'padding:5px 8px',
      'border-radius:9999px',
      'background:rgba(15,23,42,0.88)',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'border:1px solid rgba(255,255,255,0.2)',
      'box-shadow:0 6px 20px rgba(0,0,0,0.35)',
      'font-family:system-ui,-apple-system,sans-serif',
      'color:#fff',
      'font-size:12px',
      'user-select:none'
    ].join(';');

    bar.innerHTML = `
      <button type="button" data-tts-play title="Đọc câu hỏi hiện tại bằng AI" style="display:inline-flex;align-items:center;gap:5px;border:none;border-radius:9999px;padding:5px 11px;color:#fff;font-weight:700;font-size:12px;cursor:pointer;background:linear-gradient(135deg,#6366f1,#7c3aed);">
        🔊 <span>Đọc câu hỏi</span>
      </button>
      <button type="button" data-tts-auto title="Tự động đọc khi sang câu hỏi mới" style="border:1px solid rgba(255,255,255,0.2);border-radius:9999px;padding:5px 9px;color:#e2e8f0;font-weight:600;font-size:11px;cursor:pointer;background:rgba(255,255,255,0.12);">
        ⚡ Tự đọc
      </button>
      <a href="/ai-tools/doc-van-ban/" target="_blank" title="Cài đặt giọng đọc AI / Tạo file MP3" style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:rgba(255,255,255,0.12);color:#fff;text-decoration:none;font-size:13px;">
        🎙️
      </a>
      <button type="button" data-tts-collapse title="Thu gọn thanh đọc" style="border:none;background:transparent;color:#94a3b8;cursor:pointer;font-size:14px;padding:0 4px;line-height:1;">
        −
      </button>
    `;

    bar.querySelector('[data-tts-play]').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      readCurrentQuestion();
    };
    bar.querySelector('[data-tts-auto]').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const next = saveConfig({ autoRead: !getConfig().autoRead });
      if (next.autoRead) {
        const cur = extractVisibleQuestionText();
        if (cur) {
          lastAutoReadText = cur;
          lastAutoReadAt = Date.now();
          speak(cur);
        }
      } else {
        stop();
      }
      updateWidgetUi();
    };
    bar.querySelector('[data-tts-collapse]').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      widgetCollapsed = !widgetCollapsed;
      const autoBtn = bar.querySelector('[data-tts-auto]');
      const linkBtn = bar.querySelector('a');
      const colBtn = bar.querySelector('[data-tts-collapse]');
      const playSpan = bar.querySelector('[data-tts-play] span');
      if (autoBtn) autoBtn.style.display = widgetCollapsed ? 'none' : '';
      if (linkBtn) linkBtn.style.display = widgetCollapsed ? 'none' : 'inline-flex';
      if (playSpan) playSpan.style.display = widgetCollapsed ? 'none' : '';
      if (colBtn) colBtn.textContent = widgetCollapsed ? '+' : '−';
    };

    document.body && document.body.appendChild(bar);
    updateWidgetUi();
  }

  function autoReadTick() {
    ensureWidget();
    const cfg = getConfig();
    if (!cfg.enabledInGames || !cfg.autoRead || !isGameContext()) return;
    const q = extractVisibleQuestionText();
    if (!q || q.length < 4) return;
    const now = Date.now();
    if (q !== lastAutoReadText && now - lastAutoReadAt > 900) {
      lastAutoReadText = q;
      lastAutoReadAt = now;
      speak(q);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureWidget);
  } else {
    ensureWidget();
  }
  setInterval(autoReadTick, 750);

  window.SmartEduTTS = {
    speak,
    stop,
    toggle: (txt) => (isSpeakingState ? stop() : speak(txt)),
    readCurrentQuestion,
    extractVisibleQuestionText,
    cleanMathForSpeech,
    getConfig,
    setConfig: saveConfig,
    isSpeaking: () => isSpeakingState
  };
})();
