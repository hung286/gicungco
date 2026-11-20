/* ==========================================================================
   MHEdu - CÔNG NGHỆ GIỌNG ĐỌC AI TRÍ TUỆ NHÂN TẠO CHUẨN TIẾNG VIỆT (AI VOICE ENGINE)
   Tác giả: Thầy Nguyễn Mạnh Hùng - 0965.908.084
   Phát âm chuẩn tiếng Việt 100% qua Google AI Neural TTS / Translate TTS
   và SpeechSynthesis vi-VN tự nhiên.
   ========================================================================== */

(function (window) {
  'use strict';

  var currentAudio = null;
  var currentObjUrl = null;
  var currentAbortCtrl = null;

  var AIVoice = {
    speaking: false,
    autoRead: true,
    rate: 1.0,
    pitch: 1.0,
    currentUtterance: null,
    selectedVoice: null,

    // Khởi tạo engine giọng đọc
    init: function () {
      var self = this;
      try {
        var savedAuto = localStorage.getItem('mhedu_auto_ai_voice');
        if (savedAuto !== null) {
          self.autoRead = savedAuto === 'true';
        }
      } catch (e) {}

      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = function () {
          self.loadVoices();
        };
        self.loadVoices();
      }
    },

    loadVoices: function () {
      if (!('speechSynthesis' in window)) return;
      var voices = window.speechSynthesis.getVoices() || [];
      // Tìm giọng tiếng Việt thực sự
      var viVoices = voices.filter(function (v) {
        return v.lang && (v.lang.toLowerCase().indexOf('vi') === 0 || v.lang.toLowerCase().indexOf('vie') !== -1);
      });

      if (viVoices.length > 0) {
        var best = viVoices.find(function (v) {
          var name = (v.name || '').toLowerCase();
          return name.indexOf('natural') !== -1 || name.indexOf('google') !== -1 || name.indexOf('hoaimy') !== -1 || name.indexOf('namminh') !== -1;
        });
        this.selectedVoice = best || viVoices[0];
      } else {
        this.selectedVoice = null;
      }
    },

    // Chuẩn hóa văn bản toán học & đơn vị đo lường sang tiếng Việt phát âm tự nhiên
    normalizeMathText: function (text) {
      if (!text) return '';
      var s = String(text);

      // Xóa thẻ HTML nếu có
      s = s.replace(/<[^>]*>/g, ' ');

      // Chuẩn hóa các ký hiệu LaTeX / toán học
      s = s.replace(/\\dfrac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '$1 phần $2')
           .replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '$1 phần $2')
           .replace(/\\sqrt\s*\{([^}]+)\}/g, 'căn bậc hai của $1')
           .replace(/\\times|\\cdot/g, ' nhân ')
           .replace(/\\div/g, ' chia ')
           .replace(/\\le|\\leq/g, ' bé hơn hoặc bằng ')
           .replace(/\\ge|\\geq/g, ' lớn hơn hoặc bằng ')
           .replace(/\\neq|\\ne/g, ' khác ')
           .replace(/\\approx/g, ' xấp xỉ ')
           .replace(/\\pm/g, ' cộng trừ ')
           .replace(/\\pi|π/g, ' pi ')
           .replace(/\$/g, ' ');

      // Chuẩn hóa đơn vị đo lường
      s = s.replace(/cm2|cm\^2|cm²/gi, ' xăng-ti-mét vuông ')
           .replace(/dm2|dm\^2|dm²/gi, ' đề-xi-mét vuông ')
           .replace(/m2|m\^2|m²/gi, ' mét vuông ')
           .replace(/km2|km\^2|km²/gi, ' ki-lô-mét vuông ')
           .replace(/mm2|mm\^2|mm²/gi, ' mi-li-mét vuông ')
           .replace(/cm3|cm\^3|cm³/gi, ' xăng-ti-mét khối ')
           .replace(/m3|m\^3|m³/gi, ' mét khối ')
           .replace(/dm3|dm\^3|dm³/gi, ' đề-xi-mét khối ')
           .replace(/km\/h/gi, ' ki-lô-mét trên giờ ')
           .replace(/m\/s/gi, ' mét trên giây ')
           .replace(/cm\b/gi, ' xăng-ti-mét ')
           .replace(/dm\b/gi, ' đề-xi-mét ')
           .replace(/km\b/gi, ' ki-lô-mét ')
           .replace(/mm\b/gi, ' mi-li-mét ')
           .replace(/kg\b/gi, ' ki-lô-gam ')
           .replace(/\^2/g, ' bình phương ')
           .replace(/\^3/g, ' lập phương ');

      // Chuẩn hóa dấu phép tính
      s = s.replace(/\+/g, ' cộng ')
           .replace(/ - /g, ' trừ ')
           .replace(/ = /g, ' bằng ')
           .replace(/ > /g, ' lớn hơn ')
           .replace(/ < /g, ' bé hơn ');

      // Làm sạch khoảng trắng thừa
      s = s.replace(/\s+/g, ' ').trim();
      return s;
    },

    // Phát âm đoạn văn bản chuẩn tiếng Việt (Ưu tiên Online AI Audio MP3 -> Fallback SpeechSynthesis vi-VN)
    speak: function (text, onEnd) {
      this.stop();
      var cleanText = this.normalizeMathText(text);
      if (!cleanText || cleanText.length < 2) return;

      var self = this;
      self.speaking = true;
      self.updateSpeakerUI(true);

      // Thử dùng /api/tts của server MHEdu (Google Translate AI TTS chuẩn tiếng Việt 100%)
      var ttsUrl = '/api/tts?text=' + encodeURIComponent(cleanText) + '&lang=vi';

      // Tạo AbortController để huỷ nếu người dùng bấm dừng
      if (window.AbortController) {
        currentAbortCtrl = new AbortController();
      }

      fetch(ttsUrl, { signal: currentAbortCtrl ? currentAbortCtrl.signal : undefined })
        .then(function (res) {
          if (!res.ok) throw new Error('API TTS error ' + res.status);
          return res.blob();
        })
        .then(function (blob) {
          if (!self.speaking) return;
          currentObjUrl = URL.createObjectURL(blob);
          var audio = new Audio(currentObjUrl);
          currentAudio = audio;
          audio.playbackRate = self.rate || 1.0;

          audio.onended = function () {
            self.stop();
            if (typeof onEnd === 'function') onEnd();
          };

          audio.onerror = function () {
            // Nếu lỗi phát audio, fallback sang Web Speech vi-VN
            self.speakBrowserFallback(cleanText, onEnd);
          };

          audio.play().catch(function () {
            self.speakBrowserFallback(cleanText, onEnd);
          });
        })
        .catch(function (err) {
          if (err && err.name === 'AbortError') return;
          // Thử gọi trực tiếp Google Translate TTS
          self.speakDirectGoogle(cleanText, onEnd);
        });
    },

    // Phát trực tiếp qua Google Translate TTS URL
    speakDirectGoogle: function (cleanText, onEnd) {
      var self = this;
      if (!self.speaking) return;

      // Giới hạn câu dưới 180 ký tự cho Google TTS trực tiếp
      var safeText = cleanText.length > 180 ? cleanText.substring(0, 180) : cleanText;
      var directUrl = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=' + encodeURIComponent(safeText);

      var audio = new Audio(directUrl);
      currentAudio = audio;

      audio.onended = function () {
        self.stop();
        if (typeof onEnd === 'function') onEnd();
      };

      audio.onerror = function () {
        self.speakBrowserFallback(cleanText, onEnd);
      };

      audio.play().catch(function () {
        self.speakBrowserFallback(cleanText, onEnd);
      });
    },

    // Fallback chỉ khi máy có giọng đọc tiếng Việt thực thụ (vi-VN), TUYỆT ĐỐI không đọc bằng giọng tiếng Anh
    speakBrowserFallback: function (cleanText, onEnd) {
      var self = this;
      if (!('speechSynthesis' in window)) {
        self.stop();
        return;
      }

      self.loadVoices();
      if (!self.selectedVoice) {
        // Không có giọng tiếng Việt trên hệ điều hành -> dừng, tránh phát âm lơ lớ tiếng Anh
        console.warn('[MHEdu AI Voice] Không tìm thấy voice tiếng Việt vi-VN trên máy tính.');
        self.stop();
        return;
      }

      var utt = new SpeechSynthesisUtterance(cleanText);
      utt.lang = 'vi-VN';
      utt.voice = self.selectedVoice;
      utt.rate = self.rate || 1.0;
      utt.pitch = self.pitch || 1.0;

      self.currentUtterance = utt;

      utt.onend = function () {
        self.stop();
        if (typeof onEnd === 'function') onEnd();
      };

      utt.onerror = function () {
        self.stop();
      };

      window.speechSynthesis.speak(utt);
    },

    // Dừng đọc ngay lập tức
    stop: function () {
      if (currentAbortCtrl) {
        try { currentAbortCtrl.abort(); } catch (e) {}
        currentAbortCtrl = null;
      }
      if (currentAudio) {
        try { currentAudio.pause(); currentAudio.currentTime = 0; } catch (e) {}
        currentAudio = null;
      }
      if (currentObjUrl) {
        try { URL.revokeObjectURL(currentObjUrl); } catch (e) {}
        currentObjUrl = null;
      }
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      this.speaking = false;
      this.currentUtterance = null;
      this.updateSpeakerUI(false);
    },

    // Đọc trọn gói chuẩn tiếng Việt: Câu hỏi và các phương án A, B, C, D
    speakQuiz: function (questionText, optionsArray, questionIndex) {
      var speechScript = '';
      if (questionIndex !== undefined && questionIndex !== null) {
        speechScript += 'Câu số ' + questionIndex + ': ';
      }
      speechScript += questionText + '. ';

      if (optionsArray && optionsArray.length > 0) {
        var optLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
        for (var i = 0; i < optionsArray.length; i++) {
          var label = optLabels[i] || (i + 1);
          speechScript += 'Đáp án ' + label + ': ' + optionsArray[i] + '. ';
        }
      }

      this.speak(speechScript);
    },

    // Cập nhật trạng thái hiển thị của các nút loa trên giao diện
    updateSpeakerUI: function (isSpeaking) {
      var btn = document.getElementById('mhedu-ai-voice-btn');
      if (btn) {
        if (isSpeaking) {
          btn.innerHTML = '<span>⏹️</span><span>Dừng đọc AI</span>';
          btn.style.background = '#dc2626';
          btn.classList.add('speaking-pulse');
        } else {
          btn.innerHTML = '<span>🔊</span><span>Đọc câu hỏi (AI)</span>';
          btn.style.background = '#059669';
          btn.classList.remove('speaking-pulse');
        }
      }
    },

    // Gắn widget điều khiển Giọng đọc AI vào một container
    attachControlWidget: function (container, getQuizDataCallback) {
      if (!container) return;
      var self = this;

      var wrap = document.createElement('div');
      wrap.className = 'mhedu-ai-voice-widget';
      wrap.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:4px 10px;background:rgba(5,150,105,0.12);border:1px solid #10b981;border-radius:20px;margin-bottom:8px;font-family:system-ui,sans-serif;font-size:12px;color:#fff;z-index:999;';

      var readBtn = document.createElement('button');
      readBtn.id = 'mhedu-ai-voice-btn';
      readBtn.type = 'button';
      readBtn.style.cssText = 'background:#059669;color:#fff;border:none;border-radius:14px;padding:4px 10px;font-size:12px;font-weight:bold;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:0.2s;';
      readBtn.innerHTML = '<span>🔊</span><span>Đọc câu hỏi (AI)</span>';

      readBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (self.speaking) {
          self.stop();
        } else {
          var data = getQuizDataCallback();
          if (data && data.question) {
            self.speakQuiz(data.question, data.options, data.index);
          }
        }
      };

      var autoLabel = document.createElement('label');
      autoLabel.style.cssText = 'display:inline-flex;align-items:center;gap:4px;cursor:pointer;font-weight:600;font-size:11px;color:#e2e8f0;margin:0;';
      var autoCheck = document.createElement('input');
      autoCheck.type = 'checkbox';
      autoCheck.checked = self.autoRead;
      autoCheck.style.cssText = 'cursor:pointer;accent-color:#10b981;';
      autoCheck.onchange = function () {
        self.autoRead = autoCheck.checked;
        try {
          localStorage.setItem('mhedu_auto_ai_voice', self.autoRead ? 'true' : 'false');
        } catch (e) {}
      };
      autoLabel.appendChild(autoCheck);
      autoLabel.appendChild(document.createTextNode('Tự động đọc'));

      wrap.appendChild(readBtn);
      wrap.appendChild(autoLabel);
      container.appendChild(wrap);
    }
  };

  AIVoice.init();
  window.MHEDU_AI_VOICE = AIVoice;

})(window);
