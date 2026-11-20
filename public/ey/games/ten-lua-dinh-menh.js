/**
 * TÊN LỬA ĐỊNH MỆNH (FATE ROCKET / HOT-POTATO STAGE BATTLE)
 * Built for EY Platform — 100% faithful to the reference video:
 * - 45 Chibi Mascot Avatars (10x5 sprite sheet `/ey/games/ten-lua-dinh-menh/mascots.webp`)
 * - Full iMath / Azota KaTeX Math rendering via `FileParser.renderMath(el)` on DOM elements
 * - Exact Hot-Potato Fate Rocket mechanics:
 *   + Wrong answer -> immediately advances to the next question for the SAME student (rocket stays on them)
 *   + Correct answer -> +1 point & Rocket flies in a parabolic arc with smoke puffs to a NEW student
 *   + Timer expires (0s) -> Rocket blasts off with the current student (`Bay màu`) & picks a new survivor
 */

(function () {
    'use strict';

    // All 45 Chibi Mascot Definitions (mapped 1:1 to `/ey/games/ten-lua-dinh-menh/mascots.webp`, 10 cols x 5 rows)
    var MASCOTS = [
        // Row 0
        { idx: 0,  col: 0, row: 0, nickname: 'Nấm biết nói',           defaultName: 'Nguyễn Minh An' },
        { idx: 1,  col: 1, row: 0, nickname: 'Remote lạc loài',        defaultName: 'Trần Bảo Châu' },
        { idx: 2,  col: 2, row: 0, nickname: 'Ấm đun nước',            defaultName: 'Lê Gia Huy' },
        { idx: 3,  col: 3, row: 0, nickname: 'Xương rồng',             defaultName: 'Phạm Thùy Linh' },
        { idx: 4,  col: 4, row: 0, nickname: 'Khoai nướng',            defaultName: 'Hoàng Đức Mạnh' },
        { idx: 5,  col: 5, row: 0, nickname: 'Pixel vỡ',               defaultName: 'Vũ Khánh Ngân' },
        { idx: 6,  col: 6, row: 0, nickname: 'Mây mưa',                defaultName: 'Đặng Quốc Phong' },
        { idx: 7,  col: 7, row: 0, nickname: 'Cua',                    defaultName: 'Bùi Thu Quỳnh' },
        { idx: 8,  col: 8, row: 0, nickname: 'Cá chép ngáo',           defaultName: 'Đỗ Hải Sơn' },
        { idx: 9,  col: 9, row: 0, nickname: 'Sứa',                    defaultName: 'Ngô Phương Thảo' },
        // Row 1
        { idx: 10, col: 0, row: 1, nickname: 'Ốc sên',                 defaultName: 'Dương Anh Tuấn' },
        { idx: 11, col: 1, row: 1, nickname: 'Xôi cục',                defaultName: 'Lý Bảo Vy' },
        { idx: 12, col: 2, row: 1, nickname: 'Vi khuẩn dễ thương',     defaultName: 'Huỳnh Ngọc Hân' },
        { idx: 13, col: 3, row: 1, nickname: 'Gà con mặt đơ',          defaultName: 'Phan Nhật Minh' },
        { idx: 14, col: 4, row: 1, nickname: 'Dấu chấm hỏi',           defaultName: 'Võ Thanh Trúc' },
        { idx: 15, col: 5, row: 1, nickname: 'Bóng bay xì hơi',        defaultName: 'Hồ Gia Bảo' },
        { idx: 16, col: 6, row: 1, nickname: 'Vịt cao su',             defaultName: 'Trịnh Mai Anh' },
        { idx: 17, col: 7, row: 1, nickname: 'Chổi lông gà',           defaultName: 'Đinh Tuấn Kiệt' },
        { idx: 18, col: 8, row: 1, nickname: 'Phím Enter',             defaultName: 'Lâm Khánh Linh' },
        { idx: 19, col: 9, row: 1, nickname: 'Cú thức khuya',          defaultName: 'Mai Đức Anh' },
        // Row 2
        { idx: 20, col: 0, row: 2, nickname: 'Bánh răng',              defaultName: 'Tô Hoài Nam' },
        { idx: 21, col: 1, row: 2, nickname: 'Thước kẻ',               defaultName: 'Cao Thị Mỹ Duyên' },
        { idx: 22, col: 2, row: 2, nickname: 'Bánh mì mắt cá chết',    defaultName: 'Chu Minh Khôi' },
        { idx: 23, col: 3, row: 2, nickname: 'Ghế nhựa đỏ',            defaultName: 'Lương Thảo Nguyên' },
        { idx: 24, col: 4, row: 2, nickname: 'Cục bụi',                defaultName: 'Tạ Quang Vinh' },
        { idx: 25, col: 5, row: 2, nickname: 'Mèo bánh mì',            defaultName: 'Nguyễn Hoàng Yến' },
        { idx: 26, col: 6, row: 2, nickname: 'Dấu @',                  defaultName: 'Trần Đức Long' },
        { idx: 27, col: 7, row: 2, nickname: 'Dép tổ ong',             defaultName: 'Lê Phương Anh' },
        { idx: 28, col: 8, row: 2, nickname: 'Ma giấy',                defaultName: 'Phạm Gia Hưng' },
        { idx: 29, col: 9, row: 2, nickname: 'Cục lông',               defaultName: 'Hoàng Thu Hà' },
        // Row 3
        { idx: 30, col: 0, row: 3, nickname: 'Viên gạch',              defaultName: 'Vũ Minh Quân' },
        { idx: 31, col: 1, row: 3, nickname: 'Pin 1%',                 defaultName: 'Đặng Ngọc Diệp' },
        { idx: 32, col: 2, row: 3, nickname: 'Chảo chống dính',        defaultName: 'Bùi Tiến Dũng' },
        { idx: 33, col: 3, row: 3, nickname: 'USB',                    defaultName: 'Đỗ Khánh Vân' },
        { idx: 34, col: 4, row: 3, nickname: 'Bánh bao cau có',        defaultName: 'Ngô Bảo Ngọc' },
        { idx: 35, col: 5, row: 3, nickname: 'Sao biển',               defaultName: 'Dương Thanh Tùng' },
        { idx: 36, col: 6, row: 3, nickname: 'Trứng ốp la hoảng hốt',  defaultName: 'Lý Hải Yến' },
        { idx: 37, col: 7, row: 3, nickname: 'Mì tôm xoăn',            defaultName: 'Huỳnh Tấn Phát' },
        { idx: 38, col: 8, row: 3, nickname: 'Alien tí hon',           defaultName: 'Phan Như Ý' },
        { idx: 39, col: 9, row: 3, nickname: 'Dưa hấu',                defaultName: 'Võ Hoàng Long' },
        // Row 4 (5 additional mascots from reference video `ed_28.0s.jpg`)
        { idx: 40, col: 0, row: 4, nickname: 'Slime',                  defaultName: 'Hồ Thị Kim Chi' },
        { idx: 41, col: 1, row: 4, nickname: 'Bài kiểm tra bị gấp',    defaultName: 'Trịnh Quốc Bảo' },
        { idx: 42, col: 2, row: 4, nickname: 'Trân châu',              defaultName: 'Nguyễn Trần Minh Thư' },
        { idx: 43, col: 3, row: 4, nickname: 'Rêu',                    defaultName: 'Lê Hoàng Phúc' },
        { idx: 44, col: 4, row: 4, nickname: 'Cục đá',                 defaultName: 'Phạm Ngọc Mai' }
    ];

    // Sound Synthesizer (Web Audio API)
    var SoundFX = {
        ctx: null,
        muted: false,
        init: function () {
            if (!this.ctx) {
                var AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(function () {});
            }
        },
        playTone: function (freq, type, duration, vol, slideTo) {
            if (this.muted) return;
            try {
                this.init();
                if (!this.ctx) return;
                var osc = this.ctx.createOscillator();
                var gain = this.ctx.createGain();
                osc.type = type || 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                if (slideTo) {
                    osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), this.ctx.currentTime + duration);
                }
                gain.gain.setValueAtTime(vol || 0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {}
        },
        playCorrect: function () {
            var self = this;
            this.playTone(523.25, 'triangle', 0.11, 0.22);
            setTimeout(function () { self.playTone(659.25, 'triangle', 0.11, 0.22); }, 85);
            setTimeout(function () { self.playTone(783.99, 'triangle', 0.2, 0.24); }, 170);
        },
        playRocketPass: function () {
            this.playTone(280, 'sawtooth', 0.42, 0.14, 740);
        },
        playWrong: function () {
            var self = this;
            this.playTone(230, 'sawtooth', 0.16, 0.2, 160);
            setTimeout(function () { self.playTone(170, 'sawtooth', 0.22, 0.22, 115); }, 125);
        },
        playBlastOff: function () {
            var self = this;
            this.playTone(150, 'sawtooth', 0.65, 0.25, 960);
            setTimeout(function () { self.playTone(110, 'square', 0.45, 0.2, 55); }, 120);
        },
        playTick: function () {
            this.playTone(880, 'sine', 0.05, 0.08);
        },
        playVictory: function () {
            var self = this;
            var notes = [523.25, 659.25, 783.99, 1046.5];
            notes.forEach(function (n, i) {
                setTimeout(function () { self.playTone(n, 'triangle', 0.24, 0.24); }, i * 125);
            });
        }
    };

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Format text + inline images before KaTeX DOM pass
    function formatRichContent(text) {
        if (!text) return '';
        var s = String(text);
        if (window.FileParser && typeof window.FileParser.cleanMathText === 'function') {
            s = window.FileParser.cleanMathText(s);
        }
        // Preserve [IMAGE:data:...] or [IMG:...] tags as clickable zoomable images
        var images = [];
        s = s.replace(/\[(?:IMAGE|IMG):(data:image\/[^;\]]+;base64,[A-Za-z0-9+/=]+|[^\]]+)\]/gi, function (_, src) {
            var token = '___TLDM_IMG_' + images.length + '___';
            images.push(src);
            return token;
        });
        var safe = escapeHtml(s).replace(/\n/g, '<br>');
        images.forEach(function (src, idx) {
            safe = safe.replace(
                '___TLDM_IMG_' + idx + '___',
                '<img src="' + escapeHtml(src) + '" class="tldm-inline-img" alt="Hình minh họa" />'
            );
        });
        return safe;
    }

    // Properly render KaTeX math on a DOM container element (fixes the `[object HTMLElement]` bug!)
    function renderMathInContainer(el) {
        if (!el) return;
        if (window.FileParser && typeof window.FileParser.renderMath === 'function') {
            window.FileParser.renderMath(el);
        } else if (typeof window.renderMathInElement === 'function') {
            try {
                window.renderMathInElement(el, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    throwOnError: false
                });
            } catch (e) {}
        }
    }

    // Normalize any question object (from BattleSessionManager, iMath/Azota import, or custom editor)
    function normalizeQuestions(rawList) {
        if (!Array.isArray(rawList) || rawList.length === 0) return [];
        return rawList.map(function (q, idx) {
            var qText = q.text || q.question || q.content || ('Câu hỏi ' + (idx + 1));
            var rawOpts = Array.isArray(q.options) ? q.options : [];
            var opts = rawOpts.map(function (o) {
                if (o && typeof o === 'object') return String(o.text || o.content || o.label || '');
                return String(o != null ? o : '');
            });

            var cIdx = 0;
            if (typeof q.correctIndex === 'number') {
                cIdx = q.correctIndex;
            } else if (typeof q.correct === 'number') {
                cIdx = q.correct;
            } else if (typeof q.answer === 'number') {
                cIdx = q.answer;
            } else if (typeof q.correctAnswer === 'string') {
                var ch = q.correctAnswer.trim().toUpperCase().charAt(0);
                var map = { A: 0, B: 1, C: 2, D: 3 };
                if (map[ch] !== undefined) cIdx = map[ch];
            } else if (Array.isArray(q.options)) {
                var foundIdx = q.options.findIndex(function (o) { return o && typeof o === 'object' && o.isCorrect; });
                if (foundIdx >= 0) cIdx = foundIdx;
            }

            return {
                type: q.type || 'multiple-choice',
                text: qText,
                image: q.image || q.imageUrl || null,
                options: opts.length > 0 ? opts : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
                correctIndex: cIdx,
                statements: q.statements || null,
                correctAnswer: q.correctAnswer || q.answer || ''
            };
        });
    }

    // SVG for the Cyan-and-White Striped Fate Rocket (matching the video's cyan-white rocket with burning flame)
    function getFateRocketSVG(isFlying) {
        return (
            '<svg class="tldm-rocket-svg ' + (isFlying ? 'flying' : '') + '" viewBox="0 0 96 150" width="64" height="100">' +
                '<!-- Thruster Flame -->' +
                '<g class="tldm-rocket-flame">' +
                    '<path d="M30 100 C24 118 36 138 48 146 C60 138 72 118 66 100 Z" fill="#ef4444" stroke="#1e293b" stroke-width="3.5" stroke-linejoin="round"/>' +
                    '<path d="M35 100 C32 114 40 128 48 135 C56 128 64 114 61 100 Z" fill="#f97316"/>' +
                    '<path d="M40 100 C39 110 43 120 48 125 C53 120 57 110 56 100 Z" fill="#fde047"/>' +
                '</g>' +
                '<!-- Left & Right Cyan Fins -->' +
                '<path d="M28 66 L10 86 L15 100 L31 90 Z" fill="#2dd4bf" stroke="#1e293b" stroke-width="3.5" stroke-linejoin="round"/>' +
                '<path d="M68 66 L86 86 L81 100 L65 90 Z" fill="#2dd4bf" stroke="#1e293b" stroke-width="3.5" stroke-linejoin="round"/>' +
                '<!-- Rocket Main Body (Cyan & White Diagonal Stripes like video) -->' +
                '<path d="M48 8 C28 28 25 64 30 94 L66 94 C71 64 68 28 48 8 Z" fill="#2dd4bf" stroke="#1e293b" stroke-width="3.5" stroke-linejoin="round"/>' +
                '<!-- White Diagonal Band on Body -->' +
                '<path d="M29 52 L67 44 L68 64 L28 72 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>' +
                '<!-- White Nose Cone with Ribbed Collar -->' +
                '<path d="M48 8 C36 20 31 32 29 42 L67 42 C65 32 60 20 48 8 Z" fill="#e2e8f0" stroke="#1e293b" stroke-width="3.5" stroke-linejoin="round"/>' +
                '<line x1="31" y1="36" x2="65" y2="36" stroke="#1e293b" stroke-width="3"/>' +
                '<line x1="33" y1="30" x2="63" y2="30" stroke="#1e293b" stroke-width="3"/>' +
                '<circle cx="48" cy="21" r="4" fill="#ffffff" stroke="#1e293b" stroke-width="2.5"/>' +
                '<!-- Engine Nozzle -->' +
                '<rect x="34" y="90" width="28" height="9" rx="3.5" fill="#94a3b8" stroke="#1e293b" stroke-width="3.5"/>' +
            '</svg>'
        );
    }

    function injectStyles() {
        if (document.getElementById('tldm-game-styles')) return;
        var style = document.createElement('style');
        style.id = 'tldm-game-styles';
        style.textContent = [
            '.tldm-root {',
            '  position: fixed; inset: 0; z-index: 99999;',
            '  display: flex; flex-direction: column;',
            '  font-family: "Be Vietnam Pro", "Nunito", "Segoe UI", sans-serif;',
            '  background: #1e1b18; user-select: none; overflow: hidden;',
            '}',
            '/* Top Header Bar (Matches reference video white bar with right-aligned buttons) */',
            '.tldm-topbar {',
            '  height: 52px; min-height: 52px; background: #ffffff;',
            '  border-bottom: 2px solid #1e293b;',
            '  display: flex; align-items: center; justify-content: space-between;',
            '  padding: 0 18px; z-index: 100;',
            '}',
            '.tldm-topbar-left {',
            '  display: flex; align-items: center; gap: 8px;',
            '}',
            '.tldm-mode-pill {',
            '  display: inline-flex; align-items: center; gap: 6px;',
            '  font-size: 12.5px; font-weight: 800; color: #475569;',
            '  background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px;',
            '  padding: 5px 11px; cursor: pointer; transition: all 0.15s;',
            '}',
            '.tldm-mode-pill:hover { background: #f1f5f9; border-color: #94a3b8; }',
            '.tldm-mode-pill.active { background: #fef2f2; border-color: #e11d48; color: #be123c; }',
            '.tldm-topbar-right {',
            '  display: flex; align-items: center; gap: 8px; margin-left: auto;',
            '}',
            '.tldm-top-btn {',
            '  height: 36px; padding: 0 14px; border-radius: 10px;',
            '  background: #ffffff; border: 2px solid #1e293b;',
            '  box-shadow: 0 2px 0 #1e293b; font-weight: 800; font-size: 13.5px;',
            '  color: #1e293b; cursor: pointer; display: inline-flex;',
            '  align-items: center; justify-content: center; gap: 6px;',
            '  transition: transform 0.1s, background 0.15s;',
            '}',
            '.tldm-top-btn:hover { background: #f8fafc; transform: translateY(-1px); }',
            '.tldm-top-btn:active { transform: translateY(1px); box-shadow: 0 0 0 #1e293b; }',
            '.tldm-top-btn.icon-only {',
            '  width: 36px; padding: 0; font-size: 15px;',
            '  border: 1.5px solid #cbd5e1; box-shadow: none; color: #475569;',
            '}',
            '.tldm-top-btn.icon-only:hover { background: #f1f5f9; border-color: #94a3b8; }',
            '',
            '/* Theater Stage Arena */',
            '.tldm-stage {',
            '  position: relative; flex: 1; width: 100%; height: calc(100% - 52px);',
            '  background: url("/ey/games/ten-lua-dinh-menh/arena_bg.webp") center center / 100% 100% no-repeat;',
            '  overflow: hidden;',
            '}',
            '',
            '/* Pre-Start 45 Mascot Cards Scrollable Grid (10 columns) */',
            '.tldm-grid-wrap {',
            '  position: absolute; inset: 0; z-index: 25;',
            '  overflow-y: auto; overflow-x: hidden;',
            '  padding: 18px 28px 92px;',
            '  display: flex; justify-content: center; align-items: flex-start;',
            '}',
            '.tldm-grid-wrap::-webkit-scrollbar { width: 8px; }',
            '.tldm-grid-wrap::-webkit-scrollbar-thumb { background: rgba(30,41,59,0.35); border-radius: 99px; }',
            '.tldm-cards-grid {',
            '  width: min(96vw, 1760px);',
            '  display: grid; grid-template-columns: repeat(10, 1fr);',
            '  gap: 12px;',
            '}',
            '@media (max-width: 1280px) {',
            '  .tldm-cards-grid { grid-template-columns: repeat(8, 1fr); }',
            '}',
            '@media (max-width: 900px) {',
            '  .tldm-cards-grid { grid-template-columns: repeat(5, 1fr); }',
            '}',
            '.tldm-char-card {',
            '  background: rgba(255, 255, 255, 0.88);',
            '  border: 2px solid rgba(203, 213, 225, 0.95);',
            '  border-radius: 16px; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);',
            '  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;',
            '  padding: 10px 8px 12px; min-height: 165px; text-align: center; position: relative;',
            '  cursor: pointer; transition: transform 0.16s ease, border-color 0.15s, background 0.15s;',
            '}',
            '.tldm-char-card:hover {',
            '  transform: translateY(-3px); border-color: #e16b52;',
            '  background: rgba(255, 255, 255, 0.97); z-index: 2;',
            '}',
            '.tldm-mascot-sprite {',
            '  width: 82px; height: 72px;',
            '  background-image: url("/ey/games/ten-lua-dinh-menh/mascots.webp");',
            '  background-size: 1000% 500%; background-repeat: no-repeat;',
            '  flex-shrink: 0;',
            '}',
            '.tldm-card-name {',
            '  font-size: 14px; font-weight: 800; color: #0f172a;',
            '  line-height: 1.25; margin-top: 6px; max-width: 100%;',
            '  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;',
            '}',
            '.tldm-card-nick {',
            '  font-size: 11.5px; font-weight: 600; color: #64748b;',
            '  margin-top: 3px; line-height: 1.2;',
            '}',
            '',
            '/* Bottom-Center Start Button (`▶ Bắt đầu` matching `seq_24.0s.jpg`) */',
            '.tldm-start-bar {',
            '  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);',
            '  z-index: 40; display: flex; align-items: center; gap: 14px;',
            '}',
            '.tldm-start-btn {',
            '  background: #d95338; color: #ffffff;',
            '  border: 3px solid #1e293b; border-radius: 16px;',
            '  box-shadow: 0 5px 0 #1e293b, 0 8px 20px rgba(0,0,0,0.28);',
            '  padding: 12px 42px; font-size: 20px; font-weight: 900;',
            '  cursor: pointer; display: inline-flex; align-items: center; gap: 10px;',
            '  transition: transform 0.12s, background 0.15s;',
            '}',
            '.tldm-start-btn:hover { background: #ea580c; transform: translateY(-2px); }',
            '.tldm-start-btn:active { transform: translateY(3px); box-shadow: 0 2px 0 #1e293b; }',
            '',
            '/* Top Question Card (Matches `seq_30.5s.jpg` cream card with coral pill & 4 horizontal option buttons) */',
            '.tldm-question-wrap {',
            '  position: absolute; top: 14px; left: 50%; transform: translateX(-50%);',
            '  width: min(86vw, 1420px); z-index: 45;',
            '  background: rgba(254, 249, 239, 0.96);',
            '  border: 1.8px solid #e16b52; border-radius: 16px;',
            '  box-shadow: 0 6px 24px rgba(15, 23, 42, 0.12);',
            '  padding: 16px 22px 18px; display: flex; flex-direction: column; gap: 14px;',
            '}',
            '/* Prominent Selected Student (Rocket Holder) Banner below the Question Card */',
            '.tldm-holder-banner {',
            '  position: absolute; top: 205px; left: 50%; transform: translateX(-50%);',
            '  z-index: 44; display: flex; align-items: center; gap: 14px;',
            '  background: linear-gradient(135deg, #fffdf9 0%, #fff1f2 100%);',
            '  border: 3px solid #e11d48; border-radius: 22px;',
            '  box-shadow: 0 6px 0 #9f1239, 0 12px 28px rgba(225, 29, 72, 0.25);',
            '  padding: 8px 26px 8px 14px; min-width: 340px; max-width: 90vw;',
            '  animation: tldm-banner-pulse 1.2s ease-in-out infinite alternate;',
            '}',
            '@keyframes tldm-banner-pulse {',
            '  0% { transform: translateX(-50%) scale(1); }',
            '  100% { transform: translateX(-50%) scale(1.03); }',
            '}',
            '.tldm-hb-avatar {',
            '  width: 58px; height: 50px;',
            '  background-image: url("/ey/games/ten-lua-dinh-menh/mascots.webp");',
            '  background-size: 1000% 500%; background-repeat: no-repeat;',
            '  flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18));',
            '}',
            '.tldm-hb-info {',
            '  display: flex; flex-direction: column; justify-content: center; min-width: 0;',
            '}',
            '.tldm-hb-label {',
            '  font-size: 11.5px; font-weight: 900; color: #e11d48;',
            '  text-transform: uppercase; letter-spacing: 0.8px; display: flex; align-items: center; gap: 5px;',
            '}',
            '.tldm-hb-name {',
            '  font-size: 26px; font-weight: 900; color: #0f172a; line-height: 1.15;',
            '  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
            '}',
            '.tldm-hb-nick {',
            '  font-size: 13px; font-weight: 700; color: #64748b;',
            '}',
            '.tldm-q-header {',
            '  display: flex; align-items: center; justify-content: space-between; gap: 14px;',
            '}',
            '.tldm-q-left {',
            '  display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;',
            '}',
            '.tldm-q-pill {',
            '  background: #d9462f; color: #ffffff; font-weight: 900; font-size: 13px;',
            '  padding: 5px 12px; border-radius: 8px; white-space: nowrap; flex-shrink: 0;',
            '  letter-spacing: 0.3px;',
            '}',
            '.tldm-q-text {',
            '  font-size: 21px; font-weight: 800; color: #1e293b; line-height: 1.4;',
            '  flex: 1; min-width: 0; overflow-wrap: break-word;',
            '}',
            '.tldm-q-text img, .tldm-inline-img {',
            '  max-height: 110px; border-radius: 8px; cursor: zoom-in;',
            '  vertical-align: middle; margin: 4px 6px; border: 1px solid #cbd5e1;',
            '}',
            '.tldm-q-controls {',
            '  display: flex; align-items: center; gap: 8px; flex-shrink: 0;',
            '}',
            '.tldm-font-btn {',
            '  width: 30px; height: 30px; border-radius: 8px;',
            '  border: 1.5px solid #cbd5e1; background: #ffffff;',
            '  font-weight: 800; font-size: 11.5px; color: #475569; cursor: pointer;',
            '}',
            '.tldm-font-btn:hover { background: #f1f5f9; border-color: #94a3b8; }',
            '.tldm-timer-ring {',
            '  position: relative; width: 46px; height: 46px;',
            '  display: flex; align-items: center; justify-content: center;',
            '  font-weight: 900; font-size: 16px; color: #1e293b;',
            '}',
            '.tldm-timer-svg { position: absolute; inset: 0; transform: rotate(-90deg); }',
            '',
            '/* 4 Horizontal Answer Options Grid (`seq_30.5s.jpg`) */',
            '.tldm-options-grid {',
            '  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;',
            '}',
            '@media (max-width: 960px) {',
            '  .tldm-options-grid { grid-template-columns: repeat(2, 1fr); }',
            '}',
            '.tldm-opt-btn {',
            '  background: #fcf6ea; border: 1.5px solid #ebd9c0;',
            '  border-radius: 10px; padding: 12px 16px;',
            '  display: flex; align-items: center; gap: 8px;',
            '  font-size: 16.5px; font-weight: 800; color: #1e293b;',
            '  cursor: pointer; text-align: left;',
            '  transition: transform 0.1s, background 0.15s, border-color 0.15s;',
            '}',
            '.tldm-opt-btn:hover:not(:disabled) {',
            '  background: #f7ebd4; border-color: #d96b52;',
            '}',
            '.tldm-opt-letter {',
            '  color: #d9462f; font-weight: 900; font-size: 16.5px; flex-shrink: 0;',
            '}',
            '.tldm-opt-content { flex: 1; min-width: 0; overflow-wrap: break-word; }',
            '.tldm-opt-btn.correct {',
            '  background: #dcfce7 !important; border-color: #16a34a !important; color: #14532d !important;',
            '}',
            '.tldm-opt-btn.wrong {',
            '  background: #fee2e2 !important; border-color: #ef4444 !important; color: #7f1d1d !important;',
            '}',
            '',
            '/* Short Answer Input Row */',
            '.tldm-sa-row {',
            '  display: flex; align-items: center; justify-content: center; gap: 10px;',
            '}',
            '.tldm-sa-input {',
            '  width: 340px; height: 44px; border-radius: 10px;',
            '  border: 2px solid #ebd9c0; padding: 0 14px; font-size: 17px; font-weight: 700;',
            '  color: #0f172a; background: #ffffff; outline: none;',
            '}',
            '.tldm-sa-input:focus { border-color: #d9462f; }',
            '.tldm-sa-submit {',
            '  height: 44px; padding: 0 22px; border-radius: 10px;',
            '  background: #d9462f; color: #ffffff; font-weight: 800; font-size: 16px;',
            '  border: 2px solid #1e293b; box-shadow: 0 3px 0 #1e293b; cursor: pointer;',
            '}',
            '',
            '/* Stage Crowd Actors (45 Mascots standing & gently wandering on the wooden stage floor) */',
            '.tldm-crowd-layer {',
            '  position: absolute; inset: 0; z-index: 20; pointer-events: none;',
            '}',
            '.tldm-stage-actor {',
            '  position: absolute; transform: translate(-50%, -50%);',
            '  display: flex; flex-direction: column; align-items: center;',
            '  transition: left 0.65s linear, top 0.65s linear, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s;',
            '  pointer-events: auto; cursor: pointer;',
            '}',
            '/* Initial drop-in from sky when game starts (`seq_30.5s.jpg` -> `seq_32.5s.jpg`) */',
            '.tldm-stage-actor.dropping-in {',
            '  animation: tldm-drop-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) backwards;',
            '}',
            '@keyframes tldm-drop-in {',
            '  0% { transform: translate(-50%, -620px) scale(0.8); opacity: 0; }',
            '  75% { transform: translate(-50%, -44%) scale(1.06, 0.94); opacity: 1; }',
            '  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }',
            '}',
            '.tldm-actor-body {',
            '  position: relative; display: flex; align-items: center; justify-content: center;',
            '  animation: tldm-bob 0.42s ease-in-out infinite alternate;',
            '}',
            '@keyframes tldm-bob {',
            '  0% { transform: translateY(0px) rotate(-2deg); }',
            '  100% { transform: translateY(-7px) rotate(2deg); }',
            '}',
            '.tldm-stage-actor.has-rocket {',
            '  z-index: 39 !important;',
            '  transform: translate(-50%, -56%) scale(1.38) !important;',
            '}',
            '.tldm-stage-actor.has-rocket .tldm-actor-body {',
            '  animation: tldm-panic-shake 0.14s ease-in-out infinite alternate;',
            '}',
            '@keyframes tldm-panic-shake {',
            '  0% { transform: translate(-3px, 0) rotate(-3deg); }',
            '  100% { transform: translate(3px, -5px) rotate(3deg); }',
            '}',
            '.tldm-stage-actor.blasted-off {',
            '  transition: transform 0.85s cubic-bezier(0.4, 0, 1, 1), opacity 0.85s ease-in !important;',
            '  transform: translate(-50%, -950px) scale(0.6) rotate(18deg) !important;',
            '  opacity: 0 !important; pointer-events: none;',
            '}',
            '/* Attached Cyan-White Fate Rocket behind the current holder (`seq_34.5s.jpg`, `seq_51.0s.jpg`) */',
            '.tldm-attached-rocket {',
            '  position: absolute; top: -38px; right: -22px;',
            '  transform: rotate(-16deg);',
            '  z-index: -1; pointer-events: none;',
            '  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.28));',
            '}',
            '.tldm-rocket-flame {',
            '  transform-origin: 48px 100px;',
            '  animation: tldm-flame-flicker 0.13s ease-in-out infinite alternate;',
            '}',
            '@keyframes tldm-flame-flicker {',
            '  0% { transform: scaleY(0.88) scaleX(0.95); }',
            '  100% { transform: scaleY(1.22) scaleX(1.08); }',
            '}',
            '/* Nervous sweat drop & wavy mouth overlay on current rocket holder */',
            '.tldm-panic-face {',
            '  position: absolute; inset: 0; pointer-events: none;',
            '}',
            '.tldm-sweat-drop {',
            '  position: absolute; top: 10px; right: 8px;',
            '  width: 9px; height: 13px;',
            '  animation: tldm-sweat 0.85s ease-in-out infinite;',
            '}',
            '@keyframes tldm-sweat {',
            '  0% { transform: translateY(0) scale(0.9); opacity: 0.95; }',
            '  100% { transform: translateY(6px) scale(1.05); opacity: 0.25; }',
            '}',
            '/* Student Name Badge under each stage mascot */',
            '.tldm-actor-name {',
            '  margin-top: -4px; font-size: 13.5px; font-weight: 900; color: #0f172a;',
            '  white-space: nowrap; text-align: center;',
            '  text-shadow: -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff;',
            '  padding: 1px 4px; border-radius: 6px;',
            '}',
            '.tldm-stage-actor.has-rocket .tldm-actor-name {',
            '  color: #e11d48; font-size: 14.5px;',
            '  text-shadow: -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff, 0 0 10px rgba(255,255,255,0.95);',
            '}',
            '',
            '/* Parabolic Flying Rocket Layer (when passing rocket to next student `seq_49.5s.jpg`, `seq_56.0s.jpg`) */',
            '.tldm-flying-rocket {',
            '  position: absolute; z-index: 60; pointer-events: none;',
            '  transform: translate(-50%, -50%);',
            '  filter: drop-shadow(0 8px 14px rgba(0,0,0,0.32));',
            '}',
            '.tldm-smoke-puff {',
            '  position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.9);',
            '  pointer-events: none; z-index: 55;',
            '  transform: translate(-50%, -50%) scale(0.5);',
            '  animation: tldm-puff-fade 0.55s ease-out forwards;',
            '}',
            '@keyframes tldm-puff-fade {',
            '  0% { transform: translate(-50%, -50%) scale(0.55); opacity: 0.92; }',
            '  100% { transform: translate(-50%, -65%) scale(1.65); opacity: 0; }',
            '}',
            '',
            '/* End-of-Game Podium & Leaderboard Modal (Matches `seq_58.0s.jpg`) */',
            '.tldm-modal-backdrop {',
            '  position: absolute; inset: 0; z-index: 90;',
            '  background: rgba(15, 23, 42, 0.35);',
            '  display: flex; align-items: center; justify-content: center; padding: 16px;',
            '}',
            '.tldm-victory-card {',
            '  width: min(94vw, 680px); max-height: 88vh;',
            '  background: #f7efe2; border: 3.5px solid #261914; border-radius: 22px;',
            '  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);',
            '  padding: 22px 26px 18px; display: flex; flex-direction: column; align-items: center;',
            '  overflow: hidden;',
            '}',
            '.tldm-v-sub {',
            '  font-size: 12px; font-weight: 900; color: #a8432b;',
            '  letter-spacing: 0.8px; text-transform: uppercase;',
            '}',
            '.tldm-v-winner {',
            '  font-size: 32px; font-weight: 900; color: #1e293b; margin: 2px 0 10px;',
            '  text-align: center;',
            '}',
            '.tldm-podium-row {',
            '  display: flex; align-items: flex-end; justify-content: center; gap: 14px;',
            '  width: 100%; margin-bottom: 14px; padding-top: 4px;',
            '}',
            '.tldm-podium-col {',
            '  display: flex; flex-direction: column; align-items: center; width: 136px;',
            '}',
            '.tldm-podium-name {',
            '  font-size: 12.5px; font-weight: 800; color: #1e293b; text-align: center;',
            '  margin: 4px 0 6px; max-width: 132px; line-height: 1.2;',
            '}',
            '.tldm-podium-block {',
            '  width: 100%; border: 2px solid #261914; border-radius: 10px 10px 4px 4px;',
            '  display: flex; align-items: flex-start; justify-content: center; padding-top: 8px;',
            '  font-size: 20px; font-weight: 900; color: #ffffff;',
            '}',
            '.tldm-podium-block.rank-1 { height: 78px; background: #eab308; }',
            '.tldm-podium-block.rank-2 { height: 58px; background: #94a3b8; }',
            '.tldm-podium-block.rank-3 { height: 42px; background: #cd7f32; }',
            '',
            '/* Scrollable Leaderboard Table */',
            '.tldm-table-wrap {',
            '  width: 100%; flex: 1; min-height: 150px; max-height: 235px;',
            '  overflow-y: auto; background: #f3eadb; border: 1.5px solid #e2d5c1;',
            '  border-radius: 12px; margin-bottom: 14px;',
            '}',
            '.tldm-table {',
            '  width: 100%; border-collapse: collapse; font-size: 13px;',
            '}',
            '.tldm-table th {',
            '  position: sticky; top: 0; background: #efe4d2; color: #57534e;',
            '  font-weight: 800; padding: 8px 12px; text-align: left; border-bottom: 1.5px solid #e2d5c1;',
            '}',
            '.tldm-table td {',
            '  padding: 8px 12px; border-bottom: 1px solid #e7dcc8; font-weight: 700; color: #1e293b;',
            '}',
            '.tldm-status-alive { color: #57534e; font-weight: 700; }',
            '.tldm-status-out { color: #dc2626; font-weight: 800; }',
            '.tldm-v-actions {',
            '  display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%;',
            '}',
            '.tldm-v-btn {',
            '  padding: 10px 26px; border-radius: 12px; font-size: 15px; font-weight: 900;',
            '  border: 2.5px solid #1e293b; box-shadow: 0 3px 0 #1e293b; cursor: pointer;',
            '}',
            '.tldm-v-btn.primary { background: #d95338; color: #ffffff; }',
            '.tldm-v-btn.secondary { background: #ffffff; color: #1e293b; }'
        ].join('\n');
        document.head.appendChild(style);
    }

    // Build participant list from default 45 students, `window.classRoster`, or Team mode
    function buildParticipants(mode, options) {
        if (mode === 'teams') {
            var teamNames = (options && Array.isArray(options.teams) && options.teams.length >= 2)
                ? options.teams
                : ['Nhóm 1', 'Nhóm 2', 'Nhóm 3', 'Nhóm 4'];
            return teamNames.map(function (tName, idx) {
                var m = MASCOTS[idx % MASCOTS.length];
                return {
                    id: idx,
                    name: typeof tName === 'string' ? tName : (tName.name || ('Nhóm ' + (idx + 1))),
                    nickname: m.nickname,
                    mascot: m,
                    correct: 0,
                    wrong: 0,
                    points: 0,
                    alive: true
                };
            });
        }

        if (mode === 'classRoster') {
            var rosterNames = [];
            try {
                if (Array.isArray(window.classRoster) && window.classRoster.length > 0) {
                    rosterNames = window.classRoster.map(function (s) {
                        return typeof s === 'string' ? s : (s.name || s.fullName || '');
                    }).filter(Boolean);
                } else {
                    var saved = localStorage.getItem('ey_class_roster') || localStorage.getItem('classRoster');
                    if (saved) {
                        var parsed = JSON.parse(saved);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            rosterNames = parsed.map(function (s) {
                                return typeof s === 'string' ? s : (s.name || s.fullName || '');
                            }).filter(Boolean);
                        }
                    }
                }
            } catch (e) {}

            if (rosterNames.length >= 2) {
                return rosterNames.slice(0, 45).map(function (name, idx) {
                    var m = MASCOTS[idx % MASCOTS.length];
                    return {
                        id: idx,
                        name: name,
                        nickname: m.nickname,
                        mascot: m,
                        correct: 0,
                        wrong: 0,
                        points: 0,
                        alive: true
                    };
                });
            }
        }

        // Default 45 students matching the reference video (`seq_24.0s.jpg` + `ed_28.0s.jpg`)
        return MASCOTS.map(function (m, idx) {
            return {
                id: idx,
                name: m.defaultName,
                nickname: m.nickname,
                mascot: m,
                correct: 0,
                wrong: 0,
                points: 0,
                alive: true
            };
        });
    }

    // Generate natural theater-stage floor coordinates (`x: 9%..91%, y: 60%..92%`) for all participants
    function assignStagePositions(participants) {
        var n = participants.length;
        var rows = n <= 8 ? 2 : (n <= 24 ? 3 : 4);
        var perRow = Math.ceil(n / rows);
        participants.forEach(function (p, idx) {
            var r = Math.floor(idx / perRow);
            var c = idx % perRow;
            var colsInThisRow = Math.min(perRow, n - r * perRow);
            var xSpan = 82; // 9% to 91%
            var baseStep = colsInThisRow > 1 ? (xSpan / (colsInThisRow - 1)) : 0;
            var stagger = (r % 2 === 1 && colsInThisRow > 1) ? (baseStep * 0.22) : (-baseStep * 0.16);
            var jitterX = ((idx * 17) % 7 - 3) * 0.65;
            var jitterY = ((idx * 23) % 7 - 3) * 0.75;
            var baseX = Math.max(8.5, Math.min(91.5, (colsInThisRow === 1 ? 50 : 9 + c * baseStep + stagger + jitterX)));
            var baseY = Math.max(59, Math.min(92.5, 62 + r * (28 / Math.max(1, rows - 1)) + jitterY));
            p.homeX = baseX;
            p.homeY = baseY;
            p.stageX = baseX;
            p.stageY = baseY;
        });
    }

    window.launchTenLuaDinhMenhGame = function (container, options) {
        options = options || {};
        injectStyles();

        var normalizedQs = normalizeQuestions(options.questions);
        if (normalizedQs.length === 0) {
            normalizedQs = normalizeQuestions([
                { text: 'Số nào cộng với 36 thì được 90?', options: ['64', '56', '44', '54'], correctIndex: 3 },
                { text: 'Một cửa hàng có 5 thùng bánh, mỗi thùng 12 hộp, mỗi hộp 4 cái bánh. Cửa hàng có tất cả bao nhiêu cái bánh?', options: ['60 cái', '180 cái', '240 cái', '120 cái'], correctIndex: 2 },
                { text: 'Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?', options: ['48 con', '57 con', '33 con', '39 con'], correctIndex: 1 },
                { text: 'Hai số có hiệu bằng 15, số bé là 12. Tích của hai số đó bằng bao nhiêu?', options: ['180', '144', '300', '324'], correctIndex: 3 }
            ]);
        }

        var state = {
            phase: 'grid', // 'grid' | 'playing' | 'ended'
            rosterMode: 'default45', // 'default45' | 'classRoster' | 'teams'
            participants: [],
            questions: normalizedQs,
            qIndex: 0,
            holderIdx: 0,
            fontSize: 21,
            timePerQuestion: Number(options.secondsPerQuestion || options.timePerQuestion) || 30,
            timeLeft: 30,
            timerId: null,
            wanderId: null,
            paused: false,
            lockedOption: false,
            rocketFlying: false,
            justDroppedIn: false
        };

        state.participants = buildParticipants(state.rosterMode, options);
        assignStagePositions(state.participants);

        var root = document.createElement('div');
        root.className = 'tldm-root';
        container.innerHTML = '';
        container.appendChild(root);

        function stopTimer() {
            if (state.timerId) {
                clearInterval(state.timerId);
                state.timerId = null;
            }
        }

        function stopWander() {
            if (state.wanderId) {
                clearInterval(state.wanderId);
                state.wanderId = null;
            }
        }

        // Lively stage crowd running/scurrying so all 45 mascots move around briskly on the wooden stage
        function startWander() {
            stopWander();
            state.wanderId = setInterval(function () {
                if (state.paused || state.phase !== 'playing') return;
                state.participants.forEach(function (p) {
                    if (!p.alive) return;
                    var isHolder = (p.id === state.holderIdx);
                    if (isHolder || Math.random() < 0.85) {
                        var rangeX = isHolder ? 4.5 : 8.5;
                        var rangeY = isHolder ? 3.0 : 5.2;
                        var dx = (Math.random() - 0.5) * 2 * rangeX;
                        var dy = (Math.random() - 0.5) * 2 * rangeY;
                        p.stageX = Math.max(8.5, Math.min(91.5, p.homeX + dx));
                        p.stageY = Math.max(58.5, Math.min(92.5, p.homeY + dy));
                        var actorEl = root.querySelector('#tldm-actor-' + p.id);
                        if (actorEl) {
                            actorEl.style.left = p.stageX.toFixed(2) + '%';
                            actorEl.style.top = p.stageY.toFixed(2) + '%';
                            if (!isHolder) {
                                actorEl.style.zIndex = String(Math.round(p.stageY));
                            }
                        }
                    }
                });
            }, 650);
        }

        function cleanupAndExit() {
            stopTimer();
            stopWander();
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(function () {});
            }
            if (typeof options.onExit === 'function') {
                options.onExit();
            } else if (root.parentNode) {
                root.parentNode.removeChild(root);
            }
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                var el = document.documentElement;
                if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
            } else if (document.exitFullscreen) {
                document.exitFullscreen().catch(function () {});
            }
        }

        // Sprite sheet is 10 columns x 5 rows (`mascots.webp`)
        function getMascotBgPos(mascot) {
            var xPct = (mascot.col / 9) * 100;
            var yPct = (mascot.row / 4) * 100;
            return xPct.toFixed(2) + '% ' + yPct.toFixed(2) + '%';
        }

        // Render main shell
        function render() {
            root.innerHTML =
                '<div class="tldm-topbar">' +
                    '<div class="tldm-topbar-left">' +
                        (state.phase === 'grid' ? (
                            '<button class="tldm-mode-pill ' + (state.rosterMode === 'default45' ? 'active' : '') + '" data-mode="default45">👥 Cá nhân (45 HS)</button>' +
                            '<button class="tldm-mode-pill ' + (state.rosterMode === 'classRoster' ? 'active' : '') + '" data-mode="classRoster">📋 Danh sách lớp</button>' +
                            '<button class="tldm-mode-pill ' + (state.rosterMode === 'teams' ? 'active' : '') + '" data-mode="teams">⚔️ Đội (4 nhóm)</button>'
                        ) : '') +
                    '</div>' +
                    '<div class="tldm-topbar-right">' +
                        (state.phase === 'playing' ? (
                            '<button class="tldm-top-btn" id="tldm-btn-pause">' + (state.paused ? 'Tiếp tục' : 'Tạm dừng') + '</button>'
                        ) : '') +
                        '<button class="tldm-top-btn icon-only" id="tldm-btn-fs" title="Toàn màn hình">⛶</button>' +
                        '<button class="tldm-top-btn icon-only" id="tldm-btn-mute" title="Âm thanh">' + (SoundFX.muted ? '🔇' : '🔊') + '</button>' +
                        '<button class="tldm-top-btn" id="tldm-btn-exit">Thoát</button>' +
                    '</div>' +
                '</div>' +
                '<div class="tldm-stage" id="tldm-stage"></div>';

            // Bind topbar events
            var btnExit = root.querySelector('#tldm-btn-exit');
            if (btnExit) btnExit.onclick = cleanupAndExit;

            var btnFs = root.querySelector('#tldm-btn-fs');
            if (btnFs) btnFs.onclick = toggleFullscreen;

            var btnMute = root.querySelector('#tldm-btn-mute');
            if (btnMute) {
                btnMute.onclick = function () {
                    SoundFX.muted = !SoundFX.muted;
                    btnMute.textContent = SoundFX.muted ? '🔇' : '🔊';
                };
            }

            var btnPause = root.querySelector('#tldm-btn-pause');
            if (btnPause) {
                btnPause.onclick = function () {
                    state.paused = !state.paused;
                    btnPause.textContent = state.paused ? 'Tiếp tục' : 'Tạm dừng';
                };
            }

            root.querySelectorAll('.tldm-mode-pill[data-mode]').forEach(function (btn) {
                btn.onclick = function () {
                    var m = btn.getAttribute('data-mode');
                    state.rosterMode = m;
                    state.participants = buildParticipants(m, options);
                    assignStagePositions(state.participants);
                    render();
                };
            });

            var stage = root.querySelector('#tldm-stage');
            if (state.phase === 'grid') {
                renderPreStartGrid(stage);
            } else if (state.phase === 'playing') {
                renderStageCrowd(stage);
                renderQuestionCard(stage);
            } else if (state.phase === 'ended') {
                renderStageCrowd(stage);
                renderVictoryModal(stage);
            }
        }

        // Phase 1: Pre-Start 45 Mascot Cards Grid (`seq_24.0s.jpg`, `ed_28.0s.jpg`)
        function renderPreStartGrid(stage) {
            var cardsHtml = state.participants.map(function (p) {
                return (
                    '<div class="tldm-char-card" title="Nhấn để đổi tên: ' + escapeHtml(p.name) + '" data-idx="' + p.id + '">' +
                        '<div class="tldm-mascot-sprite" style="background-position:' + getMascotBgPos(p.mascot) + ';"></div>' +
                        '<div class="tldm-card-name">' + escapeHtml(p.name) + '</div>' +
                        '<div class="tldm-card-nick">' + escapeHtml(p.nickname) + '</div>' +
                    '</div>'
                );
            }).join('');

            stage.innerHTML =
                '<div class="tldm-grid-wrap">' +
                    '<div class="tldm-cards-grid">' + cardsHtml + '</div>' +
                '</div>' +
                '<div class="tldm-start-bar">' +
                    '<button class="tldm-start-btn" id="tldm-btn-start">▶ Bắt đầu</button>' +
                '</div>';

            stage.querySelectorAll('.tldm-char-card').forEach(function (card) {
                card.onclick = function () {
                    var idx = Number(card.getAttribute('data-idx'));
                    var p = state.participants[idx];
                    if (!p) return;
                    var newName = window.prompt('Đổi tên học sinh / đội (' + p.nickname + '):', p.name);
                    if (newName && newName.trim()) {
                        p.name = newName.trim();
                        var nameEl = card.querySelector('.tldm-card-name');
                        if (nameEl) nameEl.textContent = p.name;
                    }
                };
            });

            var btnStart = stage.querySelector('#tldm-btn-start');
            if (btnStart) {
                btnStart.onclick = function () {
                    SoundFX.init();
                    SoundFX.playRocketPass();
                    state.phase = 'playing';
                    state.qIndex = 0;
                    state.justDroppedIn = true;
                    var aliveList = state.participants.filter(function (p) { return p.alive; });
                    var firstTarget = aliveList[Math.floor(Math.random() * aliveList.length)] || state.participants[0];
                    state.holderIdx = firstTarget.id;
                    render();
                    startWander();
                    startQuestionTimer();
                    setTimeout(function () {
                        state.justDroppedIn = false;
                    }, 800);
                };
            }
        }

        // Render or update Stage Crowd layer (`seq_32.5s.jpg` -> `seq_57.5s.jpg`)
        function renderStageCrowd(stage) {
            var existingLayer = stage.querySelector('#tldm-crowd-layer');
            if (!existingLayer) {
                existingLayer = document.createElement('div');
                existingLayer.className = 'tldm-crowd-layer';
                existingLayer.id = 'tldm-crowd-layer';
                stage.appendChild(existingLayer);
            }

            var panicOverlayHtml =
                '<div class="tldm-panic-face">' +
                    '<svg class="tldm-sweat-drop" viewBox="0 0 14 20">' +
                        '<path d="M7 1 C7 1 1 9 1 13.5 A6 6 0 0 0 13 13.5 C13 9 7 1 7 1 Z" fill="#bae6fd" stroke="#1e293b" stroke-width="2"/>' +
                    '</svg>' +
                '</div>';

            var crowdHtml = state.participants.map(function (p) {
                var isHolder = (p.id === state.holderIdx) && p.alive && state.phase === 'playing';
                var classes = 'tldm-stage-actor';
                if (state.justDroppedIn) classes += ' dropping-in';
                if (isHolder) classes += ' has-rocket';
                if (!p.alive) classes += ' blasted-off';
                var zIdx = isHolder ? 39 : Math.round(p.stageY);
                var dropDelay = state.justDroppedIn ? ('animation-delay:' + ((p.id * 0.012) % 0.35).toFixed(3) + 's;') : '';

                return (
                    '<div class="' + classes + '" id="tldm-actor-' + p.id + '" data-actor-id="' + p.id + '" ' +
                         'style="left:' + p.stageX.toFixed(2) + '%; top:' + p.stageY.toFixed(2) + '%; z-index:' + zIdx + ';' + dropDelay + '" ' +
                         'title="' + escapeHtml(p.name + ' (' + p.nickname + ') — Đúng: ' + p.correct + ', Sai: ' + p.wrong) + '">' +
                        '<div class="tldm-actor-body" style="animation-delay:' + ((p.id * 0.13) % 1.8).toFixed(2) + 's;">' +
                            (isHolder ? '<div class="tldm-attached-rocket" id="tldm-attached-rocket">' + getFateRocketSVG(false) + '</div>' : '') +
                            '<div class="tldm-mascot-sprite" style="background-position:' + getMascotBgPos(p.mascot) + ';"></div>' +
                            (isHolder ? panicOverlayHtml : '') +
                        '</div>' +
                        '<div class="tldm-actor-name">' + escapeHtml(p.name) + '</div>' +
                    '</div>'
                );
            }).join('');

            existingLayer.innerHTML = crowdHtml;

            // Allow teacher to click any surviving mascot on stage to manually pass the rocket to that student
            existingLayer.querySelectorAll('.tldm-stage-actor').forEach(function (actorEl) {
                actorEl.onclick = function () {
                    if (state.rocketFlying || state.phase !== 'playing') return;
                    var clickedId = Number(actorEl.getAttribute('data-actor-id'));
                    var targetP = state.participants[clickedId];
                    if (!targetP || !targetP.alive || clickedId === state.holderIdx) return;
                    animateRocketPass(state.holderIdx, clickedId, function () {
                        state.holderIdx = clickedId;
                        updateRocketHolderDOM();
                    });
                };
            });
        }

        // Update who has the rocket without re-creating all 45 DOM nodes
        function updateRocketHolderDOM() {
            var stage = root.querySelector('#tldm-stage');
            if (!stage) return;
            state.participants.forEach(function (p) {
                var actorEl = stage.querySelector('#tldm-actor-' + p.id);
                if (!actorEl) return;
                var isHolder = (p.id === state.holderIdx) && p.alive && state.phase === 'playing';
                var bodyEl = actorEl.querySelector('.tldm-actor-body');
                var oldRocket = actorEl.querySelector('.tldm-attached-rocket');
                var oldPanic = actorEl.querySelector('.tldm-panic-face');

                if (isHolder) {
                    actorEl.classList.add('has-rocket');
                    actorEl.style.zIndex = '39';
                    if (bodyEl && !oldRocket) {
                        var rDiv = document.createElement('div');
                        rDiv.className = 'tldm-attached-rocket';
                        rDiv.id = 'tldm-attached-rocket';
                        rDiv.innerHTML = getFateRocketSVG(false);
                        bodyEl.insertBefore(rDiv, bodyEl.firstChild);
                    }
                    if (bodyEl && !oldPanic) {
                        var pDiv = document.createElement('div');
                        pDiv.className = 'tldm-panic-face';
                        pDiv.innerHTML = '<svg class="tldm-sweat-drop" viewBox="0 0 14 20"><path d="M7 1 C7 1 1 9 1 13.5 A6 6 0 0 0 13 13.5 C13 9 7 1 7 1 Z" fill="#bae6fd" stroke="#1e293b" stroke-width="2"/></svg>';
                        bodyEl.appendChild(pDiv);
                    }
                } else {
                    actorEl.classList.remove('has-rocket');
                    actorEl.style.zIndex = String(Math.round(p.stageY));
                    if (oldRocket) oldRocket.remove();
                    if (oldPanic) oldPanic.remove();
                }
            });
            updateHolderBannerDOM(stage);
        }

        function updateHolderBannerDOM(stage) {
            if (!stage) return;
            var bannerEl = stage.querySelector('#tldm-holder-banner');
            if (state.phase !== 'playing') {
                if (bannerEl) bannerEl.remove();
                return;
            }
            var holder = state.participants[state.holderIdx] || state.participants[0];
            if (!holder) return;
            if (!bannerEl) {
                bannerEl = document.createElement('div');
                bannerEl.className = 'tldm-holder-banner';
                bannerEl.id = 'tldm-holder-banner';
                stage.appendChild(bannerEl);
            }
            bannerEl.innerHTML =
                '<div class="tldm-hb-avatar" style="background-position:' + getMascotBgPos(holder.mascot) + ';"></div>' +
                '<div class="tldm-hb-info">' +
                    '<div class="tldm-hb-label">🚀 ĐANG GIỮ TÊN LỬA ĐỊNH MỆNH</div>' +
                    '<div class="tldm-hb-name">' + escapeHtml(holder.name) + ' <span class="tldm-hb-nick">(' + escapeHtml(holder.nickname) + ')</span></div>' +
                '</div>';
        }

        // Render or update only the Top Question Card (`seq_30.5s.jpg` -> `seq_57.5s.jpg`)
        function renderQuestionCard(stage) {
            if (state.phase !== 'playing') {
                var oldWrap = stage.querySelector('#tldm-question-wrap');
                if (oldWrap) oldWrap.remove();
                var oldBanner = stage.querySelector('#tldm-holder-banner');
                if (oldBanner) oldBanner.remove();
                return;
            }
            updateHolderBannerDOM(stage);

            var q = state.questions[state.qIndex] || state.questions[0];
            var holder = state.participants[state.holderIdx] || state.participants[0];

            var answerAreaHtml = '';
            var qType = (q && q.type) || 'multiple-choice';

            if (qType === 'short-answer') {
                answerAreaHtml =
                    '<div class="tldm-sa-row">' +
                        '<input type="text" class="tldm-sa-input" id="tldm-sa-input" placeholder="Nhập đáp án của ' + escapeHtml(holder ? holder.name : '') + '..." autocomplete="off" />' +
                        '<button class="tldm-sa-submit" id="tldm-sa-submit">Trả lời</button>' +
                    '</div>';
            } else if (qType === 'true-false' && Array.isArray(q.statements) && q.statements.length > 0 && (!q.options || q.options.length === 0)) {
                var tfOpts = q.statements.map(function (st) {
                    return (st.text || st.statement || '') + ' (' + (st.isTrue ? 'Đúng' : 'Sai') + ')';
                });
                var tfLetters = ['A.', 'B.', 'C.', 'D.'];
                answerAreaHtml =
                    '<div class="tldm-options-grid">' +
                        tfOpts.slice(0, 4).map(function (optText, idx) {
                            var cleanOpt = String(optText || '').replace(/^[A-D][\.\)\:\-]\s*/i, '');
                            return (
                                '<button class="tldm-opt-btn" data-opt-idx="' + idx + '">' +
                                    '<span class="tldm-opt-letter">' + (tfLetters[idx] || ((idx + 1) + '.')) + '</span>' +
                                    '<span class="tldm-opt-content">' + formatRichContent(cleanOpt) + '</span>' +
                                '</button>'
                            );
                        }).join('') +
                    '</div>';
            } else {
                var mcOpts = (Array.isArray(q.options) && q.options.length > 0) ? q.options : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'];
                var mcLetters = ['A.', 'B.', 'C.', 'D.'];
                answerAreaHtml =
                    '<div class="tldm-options-grid">' +
                        mcOpts.slice(0, 4).map(function (optText, idx) {
                            var cleanOpt = String(optText || '').replace(/^[A-D][\.\)\:\-]\s*/i, '');
                            return (
                                '<button class="tldm-opt-btn" data-opt-idx="' + idx + '">' +
                                    '<span class="tldm-opt-letter">' + (mcLetters[idx] || ((idx + 1) + '.')) + '</span>' +
                                    '<span class="tldm-opt-content">' + formatRichContent(cleanOpt) + '</span>' +
                                '</button>'
                            );
                        }).join('') +
                    '</div>';
            }

            var qWrap = stage.querySelector('#tldm-question-wrap');
            if (!qWrap) {
                qWrap = document.createElement('div');
                qWrap.className = 'tldm-question-wrap';
                qWrap.id = 'tldm-question-wrap';
                stage.appendChild(qWrap);
            }

            qWrap.innerHTML =
                '<div class="tldm-q-header">' +
                    '<div class="tldm-q-left">' +
                        '<span class="tldm-q-pill">CÂU ' + (state.qIndex + 1) + '</span>' +
                        '<div class="tldm-q-text" id="tldm-q-text" style="font-size:' + state.fontSize + 'px;">' +
                            formatRichContent(q.text || '') +
                            (q.image ? '<div><img src="' + escapeHtml(q.image) + '" alt="Hình câu hỏi" class="tldm-zoomable-img" /></div>' : '') +
                        '</div>' +
                    '</div>' +
                    '<div class="tldm-q-controls">' +
                        '<button class="tldm-font-btn" id="tldm-font-dec" title="Giảm cỡ chữ">A-</button>' +
                        '<button class="tldm-font-btn" id="tldm-font-inc" title="Tăng cỡ chữ">A+</button>' +
                        '<div class="tldm-timer-ring">' +
                            '<svg class="tldm-timer-svg" width="46" height="46" viewBox="0 0 46 46">' +
                                '<circle cx="23" cy="23" r="19" fill="none" stroke="#dcfce7" stroke-width="4.5"></circle>' +
                                '<circle id="tldm-timer-circle" cx="23" cy="23" r="19" fill="none" stroke="#16a34a" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="119.38" stroke-dashoffset="0"></circle>' +
                            '</svg>' +
                            '<span id="tldm-timer-num">' + state.timeLeft + '</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                answerAreaHtml;

            // Render KaTeX formulas on the DOM element!
            renderMathInContainer(qWrap);

            // Bind A- / A+ font size buttons
            var btnDec = qWrap.querySelector('#tldm-font-dec');
            var btnInc = qWrap.querySelector('#tldm-font-inc');
            var qTextEl = qWrap.querySelector('#tldm-q-text');
            if (btnDec && qTextEl) {
                btnDec.onclick = function () {
                    state.fontSize = Math.max(14, state.fontSize - 2);
                    qTextEl.style.fontSize = state.fontSize + 'px';
                };
            }
            if (btnInc && qTextEl) {
                btnInc.onclick = function () {
                    state.fontSize = Math.min(30, state.fontSize + 2);
                    qTextEl.style.fontSize = state.fontSize + 'px';
                };
            }

            // Bind Image Zoom via ZoomPanOverlay
            qWrap.querySelectorAll('img').forEach(function (img) {
                img.style.cursor = 'zoom-in';
                img.onclick = function (e) {
                    e.stopPropagation();
                    if (window.ZoomPanOverlay && typeof window.ZoomPanOverlay.open === 'function') {
                        window.ZoomPanOverlay.open(img.src);
                    } else if (window.EyZoomPanOverlay && typeof window.EyZoomPanOverlay.open === 'function') {
                        window.EyZoomPanOverlay.open(img.src);
                    } else {
                        window.open(img.src, '_blank');
                    }
                };
            });

            // Bind Multiple-Choice option clicks
            qWrap.querySelectorAll('.tldm-opt-btn').forEach(function (btn) {
                btn.onclick = function () {
                    if (state.paused || state.lockedOption || state.rocketFlying || state.phase !== 'playing') return;
                    var pickedIdx = Number(btn.getAttribute('data-opt-idx'));
                    handleAnswerAttempt(pickedIdx, btn, stage);
                };
            });

            // Bind Short-Answer submission
            var saInput = qWrap.querySelector('#tldm-sa-input');
            var saSubmit = qWrap.querySelector('#tldm-sa-submit');
            if (saInput && saSubmit) {
                var submitSA = function () {
                    if (state.paused || state.lockedOption || state.rocketFlying || state.phase !== 'playing') return;
                    var val = saInput.value.trim();
                    if (!val) return;
                    var expected = String(q.correctAnswer || '').trim();
                    var isCorrect = val.toLowerCase() === expected.toLowerCase() ||
                        (val.replace(/\s+/g, '').replace(',', '.') === expected.replace(/\s+/g, '').replace(',', '.'));
                    handleShortAnswerAttempt(isCorrect, saInput, stage);
                };
                saSubmit.onclick = submitSA;
                saInput.onkeydown = function (e) {
                    if (e.key === 'Enter') submitSA();
                };
                setTimeout(function () { saInput.focus(); }, 60);
            }
        }

        function pickNextRandomSurvivor(excludeId) {
            var survivors = state.participants.filter(function (p) {
                return p.alive && p.id !== excludeId;
            });
            if (survivors.length === 0) {
                survivors = state.participants.filter(function (p) { return p.alive; });
            }
            if (survivors.length === 0) return state.participants[0];
            return survivors[Math.floor(Math.random() * survivors.length)];
        }

        // Smooth parabolic rocket flight with white smoke puffs from `fromId` to `toId` (`seq_49.5s.jpg`, `seq_56.0s.jpg`)
        function animateRocketPass(fromId, toId, onDone) {
            var stage = root.querySelector('#tldm-stage');
            var fromP = state.participants[fromId];
            var toP = state.participants[toId];
            if (!stage || !fromP || !toP) {
                if (onDone) onDone();
                return;
            }

            state.rocketFlying = true;
            SoundFX.playRocketPass();

            var attached = stage.querySelector('#tldm-attached-rocket');
            if (attached) attached.style.opacity = '0';

            var flyer = document.createElement('div');
            flyer.className = 'tldm-flying-rocket';
            flyer.innerHTML = getFateRocketSVG(true);
            stage.appendChild(flyer);

            var startX = fromP.stageX;
            var startY = fromP.stageY - 6;
            var endX = toP.stageX;
            var endY = toP.stageY - 6;
            var peakY = Math.min(startY, endY) - 20;

            var duration = 620;
            var startTime = performance.now();
            var lastPuff = 0;

            function step(now) {
                var t = Math.min(1, (now - startTime) / duration);
                var inv = 1 - t;
                var curX = inv * inv * startX + 2 * inv * t * ((startX + endX) * 0.5) + t * t * endX;
                var curY = inv * inv * startY + 2 * inv * t * peakY + t * t * endY;

                var dx = 2 * inv * (((startX + endX) * 0.5) - startX) + 2 * t * (endX - ((startX + endX) * 0.5));
                var dy = 2 * inv * (peakY - startY) + 2 * t * (endY - peakY);
                var angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

                flyer.style.left = curX + '%';
                flyer.style.top = curY + '%';
                flyer.style.transform = 'translate(-50%, -50%) rotate(' + angleDeg.toFixed(1) + 'deg)';

                if (now - lastPuff > 60 && t < 0.88) {
                    lastPuff = now;
                    var puff = document.createElement('div');
                    puff.className = 'tldm-smoke-puff';
                    var sz = 16 + Math.random() * 14;
                    puff.style.width = sz + 'px';
                    puff.style.height = sz + 'px';
                    puff.style.left = curX + '%';
                    puff.style.top = curY + '%';
                    stage.appendChild(puff);
                    setTimeout(function () {
                        if (puff.parentNode) puff.parentNode.removeChild(puff);
                    }, 580);
                }

                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    if (flyer.parentNode) flyer.parentNode.removeChild(flyer);
                    state.rocketFlying = false;
                    if (onDone) onDone();
                }
            }
            requestAnimationFrame(step);
        }

        // Exact reference video answer resolution:
        // - Correct answer -> +1 point, rocket flies in parabolic arc to a NEW student, and advances to next question!
        // - Wrong answer -> +1 wrong, rocket STAYS on the SAME student, and immediately advances to next question!
        function handleAnswerAttempt(pickedIdx, btnEl, stage) {
            var q = state.questions[state.qIndex];
            var holder = state.participants[state.holderIdx];
            if (!q || !holder) return;

            state.lockedOption = true;
            stopTimer();

            if (pickedIdx === q.correctIndex) {
                btnEl.classList.add('correct');
                holder.correct += 1;
                holder.points += 1;
                SoundFX.playCorrect();

                var isLastQuestion = (state.qIndex + 1 >= state.questions.length);
                if (isLastQuestion) {
                    setTimeout(function () {
                        state.lockedOption = false;
                        finishGame('HẾT CÂU HỎI, XẾP THEO ĐIỂM');
                    }, 350);
                    return;
                }

                var nextTarget = pickNextRandomSurvivor(holder.id);
                // Advance to the next question while the rocket flies across the stage to the new student (`seq_49.5s.jpg`)
                state.qIndex += 1;
                renderQuestionCard(stage);
                startQuestionTimer();

                animateRocketPass(holder.id, nextTarget.id, function () {
                    state.holderIdx = nextTarget.id;
                    state.lockedOption = false;
                    updateRocketHolderDOM();
                });
            } else {
                // Wrong answer: Rocket STAYS on the current student (`seq_42.5s.jpg` -> `seq_44.5s.jpg`), advances immediately to next question!
                btnEl.classList.add('wrong');
                holder.wrong += 1;
                SoundFX.playWrong();

                setTimeout(function () {
                    state.lockedOption = false;
                    advanceToNextQuestion(stage);
                }, 220);
            }
        }

        function handleShortAnswerAttempt(isCorrect, inputEl, stage) {
            var holder = state.participants[state.holderIdx];
            if (!holder) return;

            state.lockedOption = true;
            stopTimer();

            if (isCorrect) {
                inputEl.style.borderColor = '#16a34a';
                inputEl.style.background = '#dcfce7';
                holder.correct += 1;
                holder.points += 1;
                SoundFX.playCorrect();

                var isLastQuestion = (state.qIndex + 1 >= state.questions.length);
                if (isLastQuestion) {
                    setTimeout(function () {
                        state.lockedOption = false;
                        finishGame('HẾT CÂU HỎI, XẾP THEO ĐIỂM');
                    }, 350);
                    return;
                }

                var nextTarget = pickNextRandomSurvivor(holder.id);
                state.qIndex += 1;
                renderQuestionCard(stage);
                startQuestionTimer();

                animateRocketPass(holder.id, nextTarget.id, function () {
                    state.holderIdx = nextTarget.id;
                    state.lockedOption = false;
                    updateRocketHolderDOM();
                });
            } else {
                holder.wrong += 1;
                inputEl.style.borderColor = '#dc2626';
                SoundFX.playWrong();

                setTimeout(function () {
                    state.lockedOption = false;
                    advanceToNextQuestion(stage);
                }, 240);
            }
        }

        // Only when the 30s countdown reaches 0 does the Fate Rocket blast the current holder into the sky (`Bay màu`)
        function blastOffCurrentHolder() {
            stopTimer();
            var stage = root.querySelector('#tldm-stage');
            var holder = state.participants[state.holderIdx];
            if (!holder) return;
            state.rocketFlying = true;
            SoundFX.playBlastOff();

            var actorEl = root.querySelector('#tldm-actor-' + holder.id);
            if (actorEl) {
                actorEl.classList.remove('has-rocket');
                actorEl.classList.add('blasted-off');
            }
            holder.alive = false;

            setTimeout(function () {
                state.rocketFlying = false;
                state.lockedOption = false;
                var survivors = state.participants.filter(function (p) { return p.alive; });
                if (survivors.length <= 1) {
                    finishGame('CHỈ CÒN 1 NGƯỜI TRỤ LẠI TRÊN SÂN KHẤU');
                    return;
                }
                var nextTarget = pickNextRandomSurvivor(holder.id);
                state.holderIdx = nextTarget.id;
                updateRocketHolderDOM();
                advanceToNextQuestion(stage);
            }, 850);
        }

        function advanceToNextQuestion(stage) {
            if (state.qIndex + 1 >= state.questions.length) {
                finishGame('HẾT CÂU HỎI, XẾP THEO ĐIỂM');
                return;
            }
            state.qIndex += 1;
            renderQuestionCard(stage || root.querySelector('#tldm-stage'));
            startQuestionTimer();
        }

        function startQuestionTimer() {
            stopTimer();
            state.timeLeft = state.timePerQuestion;
            updateTimerUI();

            state.timerId = setInterval(function () {
                if (state.paused || state.rocketFlying || state.phase !== 'playing') return;
                state.timeLeft -= 1;
                if (state.timeLeft <= 5 && state.timeLeft > 0) {
                    SoundFX.playTick();
                }
                updateTimerUI();
                if (state.timeLeft <= 0) {
                    var holder = state.participants[state.holderIdx];
                    if (holder) holder.wrong += 1;
                    blastOffCurrentHolder();
                }
            }, 1000);
        }

        function updateTimerUI() {
            var numEl = root.querySelector('#tldm-timer-num');
            var circleEl = root.querySelector('#tldm-timer-circle');
            if (numEl) numEl.textContent = Math.max(0, state.timeLeft);
            if (circleEl) {
                var total = state.timePerQuestion || 30;
                var pct = Math.max(0, Math.min(1, state.timeLeft / total));
                var dashOffset = 119.38 * (1 - pct);
                circleEl.style.strokeDashoffset = dashOffset.toFixed(2);
                circleEl.style.stroke = state.timeLeft <= 5 ? '#dc2626' : (state.timeLeft <= 10 ? '#f59e0b' : '#16a34a');
            }
        }

        // Phase 3: End-of-Game Podium & Leaderboard Modal (`seq_58.0s.jpg`)
        function finishGame(subtitleText) {
            stopTimer();
            stopWander();
            state.phase = 'ended';
            state.subtitleText = subtitleText || 'HẾT CÂU HỎI, XẾP THEO ĐIỂM';
            SoundFX.playVictory();
            render();
        }

        function renderVictoryModal(stage) {
            // Sort participants: alive first, then points DESC, then wrong ASC, then correct DESC
            var ranked = state.participants.slice().sort(function (a, b) {
                if (a.alive !== b.alive) return a.alive ? -1 : 1;
                if (b.points !== a.points) return b.points - a.points;
                if (a.wrong !== b.wrong) return a.wrong - b.wrong;
                return b.correct - a.correct;
            });

            var first = ranked[0] || state.participants[0];
            var second = ranked[1] || first;
            var third = ranked[2] || second;

            var rowsHtml = ranked.map(function (p, idx) {
                return (
                    '<tr>' +
                        '<td>' + (idx + 1) + '</td>' +
                        '<td>' + escapeHtml(p.name) + '</td>' +
                        '<td style="text-align:center;">' + p.correct + '</td>' +
                        '<td style="text-align:center;">' + p.wrong + '</td>' +
                        '<td style="text-align:center;font-weight:900;">' + p.points + '</td>' +
                        '<td style="text-align:right;" class="' + (p.alive ? 'tldm-status-alive' : 'tldm-status-out') + '">' +
                            (p.alive ? 'Còn trụ' : 'Bay màu') +
                        '</td>' +
                    '</tr>'
                );
            }).join('');

            var modal = document.createElement('div');
            modal.className = 'tldm-modal-backdrop';
            modal.innerHTML =
                '<div class="tldm-victory-card">' +
                    '<div class="tldm-v-sub">' + escapeHtml(state.subtitleText || 'HẾT CÂU HỎI, XẾP THEO ĐIỂM') + '</div>' +
                    '<div class="tldm-v-winner">' + escapeHtml(first.name) + '</div>' +
                    '<div class="tldm-podium-row">' +
                        '<!-- Rank 2 (Silver Left) -->' +
                        '<div class="tldm-podium-col">' +
                            '<div class="tldm-mascot-sprite" style="background-position:' + getMascotBgPos(second.mascot) + ';"></div>' +
                            '<div class="tldm-podium-name">' + escapeHtml(second.name) + '</div>' +
                            '<div class="tldm-podium-block rank-2">2</div>' +
                        '</div>' +
                        '<!-- Rank 1 (Gold Center) -->' +
                        '<div class="tldm-podium-col">' +
                            '<div class="tldm-mascot-sprite" style="transform:scale(1.16);background-position:' + getMascotBgPos(first.mascot) + ';"></div>' +
                            '<div class="tldm-podium-name">' + escapeHtml(first.name) + '</div>' +
                            '<div class="tldm-podium-block rank-1">1</div>' +
                        '</div>' +
                        '<!-- Rank 3 (Bronze Right) -->' +
                        '<div class="tldm-podium-col">' +
                            '<div class="tldm-mascot-sprite" style="background-position:' + getMascotBgPos(third.mascot) + ';"></div>' +
                            '<div class="tldm-podium-name">' + escapeHtml(third.name) + '</div>' +
                            '<div class="tldm-podium-block rank-3">3</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="tldm-table-wrap">' +
                        '<table class="tldm-table">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th>#</th>' +
                                    '<th>Học sinh</th>' +
                                    '<th style="text-align:center;">Đúng</th>' +
                                    '<th style="text-align:center;">Sai</th>' +
                                    '<th style="text-align:center;">Điểm</th>' +
                                    '<th style="text-align:right;"></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' + rowsHtml + '</tbody>' +
                        '</table>' +
                    '</div>' +
                    '<div class="tldm-v-actions">' +
                        '<button class="tldm-v-btn secondary" id="tldm-btn-back-lobby">Thoát</button>' +
                        '<button class="tldm-v-btn primary" id="tldm-btn-replay">Chơi lại</button>' +
                    '</div>' +
                '</div>';

            stage.appendChild(modal);

            var btnReplay = modal.querySelector('#tldm-btn-replay');
            if (btnReplay) {
                btnReplay.onclick = function () {
                    state.participants.forEach(function (p) {
                        p.correct = 0;
                        p.wrong = 0;
                        p.points = 0;
                        p.alive = true;
                    });
                    state.phase = 'grid';
                    state.qIndex = 0;
                    render();
                };
            }

            var btnBack = modal.querySelector('#tldm-btn-back-lobby');
            if (btnBack) {
                btnBack.onclick = cleanupAndExit;
            }
        }

        render();

        return {
            destroy: function () {
                stopTimer();
                stopWander();
            }
        };
    };
})();
