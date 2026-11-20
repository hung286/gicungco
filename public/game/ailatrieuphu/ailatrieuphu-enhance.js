/* ==========================================================================
   MHEdu - NÂNG CẤP TOÀN DIỆN CƠ CHẾ GAME & GIỌNG ĐỌC AI CHO TRIỆU PHÚ HỌC ĐƯỜNG
   Tác giả: Thầy Nguyễn Mạnh Hùng - 0965.908.084
   ========================================================================== */

(function () {
  'use strict';

  var lastSpokenText = '';
  var isAutoVoice = true;

  try {
    var savedAuto = localStorage.getItem('mhedu_auto_ai_voice');
    if (savedAuto !== null) isAutoVoice = savedAuto === 'true';
  } catch (e) {}

  // 1. CHÈN CSS TỐI ƯU GIAO DIỆN ĐỂ 4 ĐÁP ÁN A, B, C, D LUÔN HIỂN THỊ 100%
  var style = document.createElement('style');
  style.id = 'mhedu-tphd-responsive-fix';
  style.textContent = `
    /* Đảm bảo toàn bộ màn hình gameplay vừa khít viewport */
    #screen_gameplay {
      height: 100vh !important;
      max-height: 100vh !important;
      overflow: hidden !important;
      background: radial-gradient(circle at center, #001845 0%, #000c24 100%) !important;
    }
    .wrapper.h-100 {
      height: 100% !important;
      max-height: 100vh !important;
      overflow: hidden !important;
    }
    .col-gameplay {
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      height: 100% !important;
      max-height: 100vh !important;
      padding: 6px 12px 10px !important;
      overflow: hidden !important;
    }

    /* Thu nhỏ logo để không chiếm diện tích của câu hỏi & đáp án */
    .col-gameplay .game-logo {
      width: 54px !important;
      height: 54px !important;
      margin: 0 auto 2px auto !important;
      background-size: contain !important;
      background-position: center !important;
    }
    .col-gameplay .game-logo:before {
      display: none !important;
    }
    .col-gameplay .game-main {
      flex-grow: 0 !important;
      margin-bottom: 4px !important;
    }

    /* Ẩn hoàn toàn khung ảnh câu hỏi nếu không có ảnh */
    #question_image {
      margin: 0 auto !important;
      transition: height 0.2s !important;
    }
    #question_image:empty,
    #question_image:not(:has(img)) {
      display: none !important;
      height: 0 !important;
      margin: 0 !important;
    }
    #question_image img {
      max-height: 110px !important;
      max-width: 320px !important;
      object-fit: contain !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
    }

    /* Khung trợ giúp thu gọn */
    .lifelines-wrapper {
      margin-top: 4px !important;
      margin-bottom: 4px !important;
    }
    .lifeline-box-inner {
      padding: 6px 20px !important;
      gap: 16px !important;
    }
    .lifeline-btn {
      width: 44px !important;
      height: 32px !important;
    }

    /* Thanh câu hỏi và 4 đáp án */
    .qa-wrapper {
      padding: 2px 8px !important;
      margin-top: auto !important;
      width: 100% !important;
      overflow: visible !important;
    }
    .qa-container {
      width: 100% !important;
      max-width: 960px !important;
      margin: 0 auto !important;
      gap: 8px !important;
    }
    .qa-row {
      gap: 10px !important;
      margin-bottom: 2px !important;
    }
    .qa-box-outer.qa-question {
      min-height: 52px !important;
    }
    .qa-question .qa-box-inner {
      font-size: clamp(14px, 1.7vw, 17px) !important;
      padding: 8px 20px !important;
      line-height: 1.35 !important;
      text-align: center !important;
      color: #ffffff !important;
      font-weight: 700 !important;
    }
    .qa-box-outer.qa-answer {
      min-height: 44px !important;
      cursor: pointer !important;
      transition: transform 0.15s, filter 0.15s !important;
    }
    .qa-box-outer.qa-answer:hover {
      transform: scale(1.02) !important;
      filter: brightness(1.25) !important;
    }
    .qa-answer .qa-box-inner {
      font-size: clamp(13px, 1.5vw, 16px) !important;
      padding: 8px 24px !important;
      display: flex !important;
      align-items: center !important;
      font-weight: 700 !important;
      color: #ffffff !important;
    }

    /* Nút dừng cuộc chơi chuyển về góc */
    #stopGameBtn {
      position: fixed !important;
      right: 16px !important;
      bottom: 12px !important;
      z-index: 2147483000 !important;
      padding: 6px 14px !important;
      font-size: 11px !important;
      border-radius: 999px !important;
    }

    /* Cột danh sách học sinh & thang tiền */
    .col-player {
      width: 220px !important;
      min-width: 220px !important;
      background: rgba(0, 15, 45, 0.75) !important;
      backdrop-filter: blur(8px) !important;
    }
    .col-questions {
      width: 260px !important;
      min-width: 260px !important;
      background: rgba(0, 15, 45, 0.75) !important;
      backdrop-filter: blur(8px) !important;
    }

    /* Hiệu ứng xung nhịp khi AI đang đọc */
    .speaking-pulse {
      animation: aiSpeakPulse 1s infinite alternate !important;
      background: #e11d48 !important;
      border-color: #fda4af !important;
    }
    @keyframes aiSpeakPulse {
      from { box-shadow: 0 0 4px #e11d48; transform: scale(1); }
      to { box-shadow: 0 0 16px #fb7185; transform: scale(1.03); }
    }
  `;
  document.head.appendChild(style);

  // 2. KHỞI TẠO ÂM THANH GAME CHUẨN
  var sfx = {
    dung: new Audio('../vendor/tphd/assets/sounds/dung.ogg'),
    sai: new Audio('../vendor/tphd/assets/sounds/sai.ogg'),
    chucmung: new Audio('../vendor/tphd/assets/sounds/chucmung.ogg'),
    gioithieu: new Audio('../vendor/tphd/assets/sounds/gioithieu.ogg')
  };

  function playSound(name) {
    try {
      if (sfx[name]) {
        sfx[name].currentTime = 0;
        sfx[name].play().catch(function () {});
      }
    } catch (e) {}
  }

  // 3. TẠO THANH CÔNG CỤ GIỌNG ĐỌC AI TRÍ TUỆ NHÂN TẠO
  function createAiVoiceToolbar() {
    var qaWrapper = document.querySelector('.qa-wrapper');
    if (!qaWrapper || document.getElementById('mhedu-ai-voice-bar')) return;

    var bar = document.createElement('div');
    bar.id = 'mhedu-ai-voice-bar';
    bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;max-width:960px;margin:0 auto 6px;padding:4px 12px;background:rgba(5,150,105,0.25);border:1px solid #10b981;border-radius:999px;font-family:system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.3);';

    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <button type="button" id="btnSpeakAi" style="background:#059669;color:#fff;border:none;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);transition:0.2s;">
          <span>🔊</span>
          <span id="btnSpeakAiText">Đọc câu hỏi (AI)</span>
        </button>
        <label style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#a7f3d0;cursor:pointer;margin:0;">
          <input type="checkbox" id="chkAutoSpeak" ${isAutoVoice ? 'checked' : ''} style="accent-color:#10b981;cursor:pointer;">
          <span>Tự động đọc AI</span>
        </label>
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:#6ee7b7;">
        <span>🤖 Giọng Đọc AI MHEdu</span>
        <button type="button" id="btnStopAi" style="background:transparent;color:#fca5a5;border:1px solid #f87171;border-radius:10px;padding:2px 8px;font-size:10px;cursor:pointer;">Dừng</button>
      </div>
    `;

    qaWrapper.insertBefore(bar, qaWrapper.firstChild);

    var btnSpeak = document.getElementById('btnSpeakAi');
    var chkAuto = document.getElementById('chkAutoSpeak');
    var btnStop = document.getElementById('btnStopAi');

    if (btnSpeak) {
      btnSpeak.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.MHEDU_AI_VOICE && window.MHEDU_AI_VOICE.speaking) {
          window.MHEDU_AI_VOICE.stop();
          updateAiButtonUI(false);
        } else {
          readCurrentQuestion(true);
        }
      };
    }

    if (chkAuto) {
      chkAuto.onchange = function () {
        isAutoVoice = chkAuto.checked;
        if (window.MHEDU_AI_VOICE) window.MHEDU_AI_VOICE.autoRead = isAutoVoice;
        try { localStorage.setItem('mhedu_auto_ai_voice', isAutoVoice ? 'true' : 'false'); } catch (e) {}
      };
    }

    if (btnStop) {
      btnStop.onclick = function () {
        if (window.MHEDU_AI_VOICE) window.MHEDU_AI_VOICE.stop();
        updateAiButtonUI(false);
      };
    }
  }

  function updateAiButtonUI(speaking) {
    var btn = document.getElementById('btnSpeakAi');
    var txt = document.getElementById('btnSpeakAiText');
    if (btn && txt) {
      if (speaking) {
        btn.classList.add('speaking-pulse');
        txt.textContent = 'Đang đọc câu hỏi...';
      } else {
        btn.classList.remove('speaking-pulse');
        txt.textContent = 'Đọc câu hỏi (AI)';
      }
    }
  }

  // 4. HÀM ĐỌC CÂU HỎI VÀ 4 PHƯƠNG ÁN
  function readCurrentQuestion(force) {
    var qEl = document.getElementById('question_content');
    if (!qEl) return;

    var qText = qEl.innerText.trim();
    if (!qText || qText.indexOf('Vui lòng chọn người chơi') !== -1) return;
    if (!force && !isAutoVoice) return;
    if (!force && qText === lastSpokenText) return;

    lastSpokenText = qText;

    var opts = [];
    for (var i = 0; i < 4; i++) {
      var optEl = document.getElementById('ans_' + i);
      if (optEl && optEl.innerText.trim()) {
        opts.push(optEl.innerText.trim());
      }
    }

    if (window.MHEDU_AI_VOICE) {
      updateAiButtonUI(true);
      window.MHEDU_AI_VOICE.speakQuiz(qText, opts);
      // Khi đọc xong cập nhật lại nút
      var checkSpeaking = setInterval(function () {
        if (!window.MHEDU_AI_VOICE.speaking) {
          clearInterval(checkSpeaking);
          updateAiButtonUI(false);
        }
      }, 500);
    }
  }

  // 5. THEO DÕI THAY ĐỔI CÂU HỎI TRONG GAME (MUTATION OBSERVER)
  function observeQuestionChanges() {
    var qEl = document.getElementById('question_content');
    if (!qEl) return;

    var observer = new MutationObserver(function () {
      setTimeout(function () {
        readCurrentQuestion(false);
      }, 600);
    });

    observer.observe(qEl, { childList: true, characterData: true, subtree: true });
  }

  // 6. XỬ LÝ 3 QUYỀN TRỢ GIÚP (50:50, GỌI BẠN, TỔ TƯ VẤN)
  function attachLifelineEnhancements() {
    // 50:50: GameApp đã có logic gốc chuẩn và phát trogiup.ogg, không can thiệp DOM tránh ẩn nhầm đáp án đúng.

    // Hỏi ý kiến một bạn (Người thân)
    var btnTeacher = document.getElementById('ll-teacher');
    if (btnTeacher && !btnTeacher.__mheduAttached) {
      btnTeacher.__mheduAttached = true;
      btnTeacher.addEventListener('click', function () {
        setTimeout(function () {
          var modalBody = document.getElementById('lifelineModalBody');
          var correctIdx = (window.GameApp && GameApp.state && GameApp.state.currentQuestion)
            ? GameApp.state.currentQuestion.answer
            : 0;
          var letters = ['A', 'B', 'C', 'D'];
          if (modalBody) {
            modalBody.innerHTML = `
              <div style="text-align:center;padding:15px;font-family:system-ui;">
                <div style="font-size:40px;margin-bottom:10px;">👤</div>
                <h4 style="color:#059669;font-weight:800;margin-bottom:10px;">Ý KIẾN CỦA BẠN ĐỒNG HÀNH</h4>
                <p style="font-size:16px;line-height:1.6;color:#1e293b;">
                  "Chào bạn! Sau khi suy nghĩ kỹ, mình tin chắc <b>phương án ${letters[correctIdx]}</b> là đáp án chính xác nhất. Bạn hãy tự tin chọn nhé!"
                </p>
              </div>
            `;
          }
        }, 200);
      });
    }

    // Hỏi ý kiến tổ tư vấn / khán giả
    var btnAudience = document.getElementById('ll-audience');
    if (btnAudience && !btnAudience.__mheduAttached) {
      btnAudience.__mheduAttached = true;
      btnAudience.addEventListener('click', function () {
        setTimeout(function () {
          var modalBody = document.getElementById('lifelineModalBody');
          var correctIdx = (window.GameApp && GameApp.state && GameApp.state.currentQuestion)
            ? GameApp.state.currentQuestion.answer
            : 0;
          var p = [10, 10, 10, 10];
          p[correctIdx] = 70;
          var remaining = 30;
          for (var i = 0; i < 4; i++) {
            if (i !== correctIdx) {
              p[i] = Math.floor(Math.random() * 10) + 5;
            }
          }
          if (modalBody) {
            modalBody.innerHTML = `
              <div style="padding:15px;font-family:system-ui;">
                <h4 style="color:#059669;font-weight:800;text-align:center;margin-bottom:15px;">KẾT QUẢ BÌNH CHỌN KHÁN GIẢ</h4>
                <div style="display:flex;align-items:flex-end;justify-content:center;gap:25px;height:140px;padding-bottom:10px;border-bottom:2px solid #cbd5e1;">
                  <div style="text-align:center;"><div style="background:#3b82f6;height:${p[0]}px;width:38px;border-radius:6px 6px 0 0;margin:0 auto;"></div><b style="font-size:12px;">A: ${p[0]}%</b></div>
                  <div style="text-align:center;"><div style="background:#10b981;height:${p[1]}px;width:38px;border-radius:6px 6px 0 0;margin:0 auto;"></div><b style="font-size:12px;">B: ${p[1]}%</b></div>
                  <div style="text-align:center;"><div style="background:#f59e0b;height:${p[2]}px;width:38px;border-radius:6px 6px 0 0;margin:0 auto;"></div><b style="font-size:12px;">C: ${p[2]}%</b></div>
                  <div style="text-align:center;"><div style="background:#ef4444;height:${p[3]}px;width:38px;border-radius:6px 6px 0 0;margin:0 auto;"></div><b style="font-size:12px;">D: ${p[3]}%</b></div>
                </div>
              </div>
            `;
          }
        }, 200);
      });
    }
  }

  // 7. KHỞI TẠO TỔNG THỂ
  function initEnhancement() {
    createAiVoiceToolbar();
    observeQuestionChanges();
    attachLifelineEnhancements();

    // Reset visibility cho các nút đáp án khi sang câu mới
    document.querySelectorAll('.ans-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Âm thanh khi chọn đáp án
        setTimeout(function () {
          if (btn.classList.contains('correct')) {
            playSound('dung');
          } else if (btn.classList.contains('wrong')) {
            playSound('sai');
          }
        }, 100);
      });
    });

    console.log('[MHEdu] Triệu Phú Học Đường — Nâng cấp giao diện & Giọng đọc AI hoàn tất.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancement);
  } else {
    initEnhancement();
  }

  // Quét lại khi giao diện thay đổi
  setInterval(function () {
    createAiVoiceToolbar();
    attachLifelineEnhancements();
  }, 1000);

})();
