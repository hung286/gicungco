// ==============================================================================
// TRÒ CHƠI KÉO CO (TUG OF WAR) - BATTLE ARENA ĐỐI KHÁNG 2 ĐỘI
// Chuẩn xác 100% đồ họa và cơ chế gốc PomyAI (https://pomyai.com/gv/tro-choi/keo-co)
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lê Hồng Phong (0965.908.084)
// ==============================================================================

(function(global) {
  'use strict';

  // 1. INJECT STYLES
  function injectStyles() {
    if (document.getElementById('keo-co-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'keo-co-styles';
    styleEl.textContent = `
      .tug-stage{--tug-edge:transparent;--tug-nen:max(100dvh, 56.25vw);--tug-ti-le-chan:.76;--tug-chan:max(186px, calc(100dvh - var(--tug-ti-le-chan) * var(--tug-nen)));--tug-nen-doi:calc(100dvh - var(--tug-chan) - var(--tug-ti-le-chan) * var(--tug-nen));--tug-le-duoi:17vw;--tug-day:6.2vw;z-index:60;background-color:#9ad06a;background-image:url(/ey/games/tug/tug-schoolyard-balanced.webp?v=2);background-size:cover;background-position:center var(--tug-nen-doi);color:#16324a;font-family:var(--font-sans);background-repeat:no-repeat;flex-direction:column;display:flex;position:fixed;inset:0;overflow:hidden}
.tug-stage:after{content:"";pointer-events:none;transition:box-shadow .25s;position:absolute;inset:0}
.tug-stage[style*=--tug-edge]:after{animation:.9s ease-in-out infinite tug-edge-pulse}
@keyframes tug-edge-pulse{0%,to{box-shadow:inset 0 0 0 4px #0000}
50%{box-shadow:inset 0 0 34px 10px var(--tug-edge)}
.tug-head{z-index:5;background:0 0;justify-content:flex-end;align-items:center;gap:14px;padding:10px clamp(12px,3vw,36px);display:flex}
.tug-tools{align-items:center;gap:8px;display:inline-flex}
.tug-btn{color:#16324a;cursor:pointer;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);background:#ffffffeb;border:1px solid #0000001f;border-radius:10px;padding:8px 14px;font-size:14px;font-weight:700;transition:background .15s,transform .1s;box-shadow:0 8px 20px -12px #16324a80}
.tug-btn:hover{background:#fff}
.tug-btn:active{transform:scale(.97)}
.tug-btn--primary{color:#fff;background:#12b5a5;border-color:#0000}
.tug-btn--primary:hover{background:#0ea394}
.tug-btn--big{border-radius:16px;padding:12px 34px;font-size:18px}
.tug-qbar{z-index:5;background:linear-gradient(#fff,#f8fafc);border:2px solid #16324a17;border-radius:22px;align-items:center;gap:20px;width:fit-content;max-width:min(980px,100% - 24px);margin:10px auto 0;padding:10px 18px 10px 28px;animation:.3s cubic-bezier(.34,1.56,.64,1) tug-pop;display:flex;position:relative;box-shadow:0 18px 45px -18px #16324a73,0 4px 10px -2px #16324a14}
.tug-qbar__body{flex:1;min-width:0}
.tug-qbar__text{color:#0f172a;letter-spacing:-.01em;font-size:clamp(22px,2.8vw,36px);font-weight:900;line-height:1.25}
.tug-qbar__num{font-size:inherit;color:#0d9488;margin-right:6px;font-weight:900}
.tug-timer{flex-shrink:0;width:68px;height:68px;position:relative}
.tug-timer__svg{width:100%;height:100%;display:block}
.tug-timer__num{font-variant-numeric:tabular-nums;color:#0f172a;justify-content:center;align-items:center;font-size:24px;font-weight:900;display:flex;position:absolute;inset:0}
.tug-timer.is-urgent .tug-timer__num{color:#ef4444;animation:.5s steps(2,end) infinite tug-blink}
@keyframes tug-blink{50%{opacity:.35}
.tug-field{background:0 0;flex-direction:column;flex:1;min-height:0;display:flex;position:relative}
.tug-field:after{content:"";pointer-events:none;background:linear-gradient(#fff0 62%,#45932d33);position:absolute;inset:0}
.tug-scene{z-index:1;flex:1;min-height:0;position:relative;overflow:hidden}
.tug-svg{z-index:3;pointer-events:none;width:100%;height:100%;display:block;position:absolute;inset:0}
.tug-svg-backdrop,.tug-kid,.tug-rope,.tug-knotbow{display:none}
.tug-row{--tug-row-shift:0vw;left:50%;bottom:calc(var(--tug-chan) - var(--tug-le-duoi));z-index:2;width:var(--tug-row-w,88vw);pointer-events:none;-webkit-user-select:none;user-select:none;transform:translateX(calc(-50% + var(--tug-row-shift)));transform-origin:50% 74%;filter:drop-shadow(0 18px 14px #183c2238);will-change:transform;transition:transform .74s cubic-bezier(.22,1,.36,1);position:absolute}
.tug-row__img{transform-origin:50% 48%;width:100%;height:auto;display:block}
.tug-row.is-moving .tug-row__img{animation:.74s cubic-bezier(.33,.9,.32,1) tug-row-heave}
@keyframes tug-row-heave{0%{transform:translateY(0)scaleX(1)}
.tug-pads{z-index:6;height:var(--tug-chan);pointer-events:none;justify-content:space-between;align-items:stretch;gap:clamp(8px,1.6vw,18px);padding:4px clamp(10px,2vw,22px) clamp(6px,1.2vh,12px);display:flex;position:absolute;inset:auto 0 0}
.tug-pads>*{pointer-events:auto}
.tug-pads.is-paused{pointer-events:none;filter:blur(7px);opacity:.6;-webkit-user-select:none;user-select:none}
.tug-goals{z-index:4;pointer-events:none;position:absolute;inset:0}
.tug-goalmid{left:var(--tug-bow-x,50%);bottom:calc(var(--tug-chan) + var(--tug-day));background:repeating-linear-gradient(#ffffffe6 0 9px,#0000 9px 18px);border-radius:2px;width:2px;height:15vw;position:absolute;transform:translate(-50%)}
.tug-goal{bottom:calc(var(--tug-chan) + var(--tug-day));flex-direction:column;align-items:center;height:15.5vw;display:flex;position:absolute;transform:translate(-50%)}
.tug-goal--l{left:calc(var(--tug-bow-x,50%) - var(--tug-travel,4vw))}
.tug-goal--r{left:calc(var(--tug-bow-x,50%) + var(--tug-travel,4vw))}
.tug-goal__flag{background:var(--c);transform-origin:0;flex:none;width:20px;height:13px;position:relative;box-shadow:0 2px 5px #00000047}
.tug-goal--l .tug-goal__flag{clip-path:polygon(0 0,100% 0,62% 50%,100% 100%,0 100%);align-self:flex-start}
.tug-goal--r .tug-goal__flag{clip-path:polygon(0 0,100% 0,100% 100%,0 100%,38% 50%);align-self:flex-end}
.tug-goal__line{background:repeating-linear-gradient(180deg, color-mix(in srgb, var(--c) 88%, #fff) 0 8px, transparent 8px 15px);opacity:.9;border-radius:3px;flex:1;width:3px}
.tug-goal.is-reached .tug-goal__line{opacity:1;box-shadow:0 0 12px 2px color-mix(in srgb, var(--c) 65%, transparent)}
.tug-goal.is-reached .tug-goal__flag{animation:.45s ease-in-out infinite tug-goal-wave}
@keyframes tug-goal-wave{0%,to{transform:rotate(-6deg)}
.tug-cloud{animation:46s linear infinite alternate tug-drift}
.tug-cloud--2{animation-duration:64s;animation-direction:alternate-reverse}
@keyframes tug-drift{0%{transform:translate(-30px)}
.tug-kid{transform-box:fill-box;transform-origin:50% 100%;animation:1.25s ease-in-out infinite tug-idle}
@keyframes tug-idle{0%{transform:rotate(0)translate(0)}
.tug-kid__body{transform-box:fill-box;transform-origin:50% 100%;animation:1.25s ease-in-out infinite tug-breathe}
@keyframes tug-breathe{0%,to{transform:scaleY(1)}
.tug-kid.is-pulling{animation:.74s cubic-bezier(.34,1.4,.5,1) tug-heave}
@keyframes tug-heave{0%{transform:rotate(-5deg)translate(-2px)}
.tug-kid.is-losing{animation:.74s cubic-bezier(.3,.8,.4,1) tug-drag}
@keyframes tug-drag{0%{transform:rotate(0)}
.tug-kid.is-stumble{animation:.82s cubic-bezier(.3,.7,.4,1) forwards tug-stumble}
@keyframes tug-stumble{0%{transform:rotate(4deg)}
.tug-kid.is-stumble .tug-dust{animation:.75s ease-out .25s tug-dust}
@keyframes tug-dust{0%{opacity:0;transform:scale(.4)}
.tug-kid.is-celebrate{animation:.62s ease-in-out infinite tug-jump}
@keyframes tug-jump{0%,to{transform:translateY(0)rotate(-2deg)}
.tug-kid.is-collapsed{animation:.6s ease-in forwards tug-collapse}
@keyframes tug-collapse{0%{transform:rotate(0)}
.tug-kid.is-collapsed .tug-dust{animation:.8s ease-out .3s tug-dust}
.tug-pad{z-index:10;border:2.5px solid var(--c);background:#fffffff5;border-radius:18px;flex-direction:column;flex:0 auto;width:min(700px,46vw);height:100%;animation:.3s cubic-bezier(.34,1.56,.64,1) tug-pop;display:flex;position:relative;overflow:hidden;box-shadow:0 14px 36px -14px #16324a73}
.tug-pad.is-locked{opacity:.55;filter:saturate(.65);pointer-events:none}
.tug-pad.is-turn{box-shadow:0 0 0 3px color-mix(in srgb, var(--c) 45%, transparent), 0 14px 36px -14px #16324a73}
.tug-pad__grid{grid-template-columns:1fr 1fr;gap:clamp(6px,.9vh,11px);padding:clamp(6px,.9vh,10px) 9px clamp(7px,1vh,11px);display:grid}
.tug-pad{--tug-fs:clamp(13px, calc(var(--tug-chan) / 13), 20px)}
.tug-pad__grid{flex:1;grid-auto-rows:minmax(max-content,1fr);align-content:stretch;min-height:0;overflow:hidden}
.tug-pad__grid.is-tran{overflow-y:auto}
.tug-pad__btn{border:1.5px solid color-mix(in srgb, var(--c) 32%, #fff);background:color-mix(in srgb, var(--c) 9%, #fff);cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent;touch-action:manipulation;border-radius:12px;align-items:center;gap:clamp(7px,.7vw,11px);min-height:0;padding:clamp(6px,.9vh,12px) clamp(9px,.9vw,15px);transition:transform .1s,background .15s,border-color .15s;display:flex}
.tug-pad__btn:hover:not(:disabled){background:color-mix(in srgb, var(--c) 20%, #fff);border-color:var(--c)}
.tug-pad__btn:active:not(:disabled){transform:scale(.96)}
.tug-pad__btn:disabled{cursor:default}
.tug-pad__letter{width:calc(var(--tug-fs) * 1.5);height:calc(var(--tug-fs) * 1.5);background:var(--c);color:#fff;font-weight:900;font-size:calc(var(--tug-fs) * .78);border-radius:50%;flex-shrink:0;justify-content:center;align-items:center;display:inline-flex}
.tug-pad__text{min-width:0;font-size:var(--tug-fs);color:#14283c;overflow-wrap:anywhere;text-align:left;-webkit-hyphens:auto;hyphens:auto;font-weight:700;line-height:1.28}
.tug-pad__btn.is-correct{background:#dcfce7;border-color:#22c55e}
.tug-pad__btn.is-correct .tug-pad__letter{background:#22c55e}
.tug-pad__btn.is-wrong{background:#fee2e2;border-color:#ef4444;animation:.35s tug-shake-x}
.tug-pad__btn.is-wrong .tug-pad__letter{background:#ef4444}
.tug-pad__btn.is-dim{opacity:.45}
.tug-pad__key{border:1.5px solid color-mix(in srgb, var(--c) 45%, #fff);color:color-mix(in srgb, var(--c) 70%, #14283c);font-family:ui-monospace,SF Mono,Menlo,monospace;font-size:calc(var(--tug-fs) * .68);background:#fff;border-bottom-width:3px;border-radius:7px;flex-shrink:0;align-self:flex-start;margin-left:auto;padding:2px 7px;font-weight:900;line-height:1.3}
.tug-pad__btn:disabled .tug-pad__key{opacity:.5}
@keyframes tug-shake-x{0%,to{transform:translate(0)}
.tug-toast{z-index:25;white-space:nowrap;pointer-events:none;-webkit-user-select:none;user-select:none;background:linear-gradient(#fff 0%,#f8fafc 100%);border:2px solid #16324a1f;border-radius:20px;justify-content:center;align-items:center;max-width:min(92vw,760px);padding:12px 32px;animation:.3s cubic-bezier(.34,1.56,.64,1) tug-pop;display:inline-flex;position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);box-shadow:0 18px 45px -18px #16324a73,0 4px 10px -2px #16324a14}
.tug-toast.is-good{border-color:#10b981}
.tug-toast.is-bad{border-color:#ef4444}
.tug-toast.is-timeout{border-color:#f59e0b}
.tug-toast__text{color:#0f172a;letter-spacing:-.01em;margin:0;font-size:clamp(17px,2.2vw,24px);font-weight:800;line-height:1.25}
.tug-toast__name{font-weight:900}
.tug-toast__action{color:#059669;font-weight:900}
.tug-toast__wrong{color:#dc2626;font-weight:900}
.tug-toast__warn{color:#d97706;font-weight:900}
.tug-qbar,.tug-pad{animation-name:tug-pop-flow}
@keyframes tug-pop-flow{0%{opacity:0;transform:translateY(-8px)scale(.98)}
.tug-start{z-index:40;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);background:#0e1e2e73;justify-content:center;align-items:center;display:flex;position:absolute;inset:0}
.tug-start__card{text-align:center;background:#fff;border:3px solid #6ee7b7;border-radius:26px;width:min(480px,100% - 32px);padding:28px 32px;animation:.35s cubic-bezier(.34,1.56,.64,1) tug-pop-flow;box-shadow:0 40px 90px -24px #0000008c}
.tug-start__eyebrow{letter-spacing:.24em;color:#0e9488;font-size:12px;font-weight:900}
.tug-start__title{color:#059669;margin:0 0 20px;font-size:26px;font-weight:900}
.tug-start__teamhint{display:none}
.tug-start__vs{justify-content:center;align-items:center;gap:12px;margin-bottom:24px;display:flex}
.tug-start__team{color:#fff;text-overflow:ellipsis;white-space:nowrap;border-radius:12px;max-width:180px;padding:7px 16px;font-size:15px;font-weight:800;overflow:hidden}
.tug-start__x{color:#94a3b8;font-size:15px;font-weight:900}
.tug-start__teamedit{border:2.5px solid var(--c);background:#fff;border-radius:16px;align-items:center;gap:8px;padding:6px 10px;display:inline-flex;box-shadow:0 2px 8px #0000000f}
.tug-start__color{cursor:pointer;background:0 0;border:none;border-radius:6px;flex-shrink:0;width:28px;height:28px;padding:0}
.tug-start__name{color:#14283c;text-align:center;background:0 0;border:none;outline:none;width:140px;font-size:16px;font-weight:800}
.tug-start__name::placeholder{color:#cbd5e1;font-weight:700}
.tug-start__hint{color:#475569;margin-bottom:16px;font-size:13.5px;line-height:1.55}
.tug-start__timer{display:none}
.tug-start__sec{color:#14283c;font-variant-numeric:tabular-nums;min-width:52px;font-size:20px}
.tug-start .game-inputmode{--game-inputmode-on:#059669}
.tug-start__actions{justify-content:center;align-items:center;gap:10px;display:flex}
.tug-finish{z-index:60;background:#0814228c;flex-direction:column;justify-content:center;align-items:center;gap:22px;display:flex;position:fixed;inset:0}
.tug-finish__card{text-align:center;background:#fff;border:3px solid;border-radius:26px;padding:32px 56px;animation:.4s cubic-bezier(.34,1.56,.64,1) tug-pop-flow;box-shadow:0 30px 80px -20px #00000080}
.tug-finish__emoji{font-size:64px;line-height:1}
.tug-finish__title{margin-top:8px;font-size:clamp(28px,4vw,48px);font-weight:900}
.tug-finish__actions{gap:12px;display:flex}
.tug-modal{z-index:70;background:#08142280;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}
.tug-modal__box{background:#fff;border-radius:18px;max-width:380px;padding:22px;box-shadow:0 20px 50px -16px #00000080}
@media (max-width:900px){.tug-row{--tug-le-duoi:34vw;width:172vw}
      
      /* Container & Layout Overrides */
      .tug-stage {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
        display: flex;
        flex-direction: column;
        background-color: #9ad06a;
        background-image: url(/ey/games/tug/tug-schoolyard-balanced.webp);
        background-size: cover;
        background-position: center var(--tug-nen-doi);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .game-turn-pulse {
        animation: turn-pulse 1.4s ease-in-out infinite;
      }
      @keyframes turn-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      
      .tug-pad__btn {
        transition: transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2), background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
      }
      .tug-pad__btn:active:not(:disabled) {
        transform: scale(0.96) !important;
      }
      .tug-pad__btn.is-correct {
        background: #22c55e !important;
        border-color: #16a34a !important;
        color: #fff !important;
        transform: scale(1.04) !important;
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.6) !important;
      }
      .tug-pad__btn.is-correct .tug-pad__text {
        color: #ffffff !important;
      }
      .tug-pad__btn.is-correct .tug-pad__letter-circle {
        background: #16a34a !important;
      }
      .tug-pad__btn.is-wrong {
        background: #fee2e2 !important;
        border-color: #ef4444 !important;
        animation: tug-shake-btn 0.4s ease !important;
      }
      .tug-pad__btn.is-wrong .tug-pad__text {
        color: #dc2626 !important;
      }
      @keyframes tug-shake-btn {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
      }
      .tug-pad__btn.is-dim {
        opacity: 0.35 !important;
        filter: grayscale(0.5);
      }

      .tug-toast {
        z-index: 55;
        position: absolute;
        top: 38%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        box-shadow: 0 18px 45px -18px rgba(22, 50, 74, 0.45), 0 4px 10px -2px rgba(22, 50, 74, 0.15);
      }
      
      /* Confetti Canvas */
      .tug-confetti-canvas {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 99;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 2. WEB AUDIO SYNTHESIZER
  class TugSoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }
    ensureCtx() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
    play(name, opts = {}) {
      if (!this.enabled) return;
      this.ensureCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      try {
        switch (name) {
          case 'tick': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.08);
            break;
          }
          case 'thud': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(110, t);
            osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
            break;
          }
          case 'pull': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, t);
            osc.frequency.exponentialRampToValueAtTime(440, t + 0.2);
            osc.frequency.exponentialRampToValueAtTime(180, t + 0.45);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.45);
            break;
          }
          case 'correct': {
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, t + idx * 0.08);
              gain.gain.setValueAtTime(0.25, t + idx * 0.08);
              gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.3);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + idx * 0.08);
              osc.stop(t + idx * 0.08 + 0.3);
            });
            break;
          }
          case 'wrong': {
            [220, 196].forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'sawtooth';
              osc.frequency.setValueAtTime(freq, t + idx * 0.12);
              gain.gain.setValueAtTime(0.28, t + idx * 0.12);
              gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.35);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + idx * 0.12);
              osc.stop(t + idx * 0.12 + 0.35);
            });
            break;
          }
          case 'whistle': {
            for (let i = 0; i < 2; i++) {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'square';
              osc.frequency.setValueAtTime(i === 0 ? 2400 : 2800, t);
              gain.gain.setValueAtTime(0.18, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t);
              osc.stop(t + 0.4);
            }
            break;
          }
          case 'fanfare': {
            const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
            notes.forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(freq, t + idx * 0.09);
              gain.gain.setValueAtTime(0.3, t + idx * 0.09);
              gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.5);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + idx * 0.09);
              osc.stop(t + idx * 0.09 + 0.5);
            });
            break;
          }
          case 'crowd': {
            const bufferSize = this.ctx.sampleRate * 0.6;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
              data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, t);
            filter.Q.setValueAtTime(1.5, t);
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.15 * (opts.intensity || 0.8), t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 0.6);
            break;
          }
        }
      } catch (err) {}
    }
  }

  // 3. CONFETTI EFFECT
  function runConfetti(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || window.innerHeight;
    
    const pieces = [];
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#facc15'];
    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 50,
        w: 8 + Math.random() * 8,
        h: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 3,
        rot: Math.random() * 360,
        vrot: (Math.random() - 0.5) * 8
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.vrot;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };
    render();
    return () => cancelAnimationFrame(animId);
  }

  // 4. MAIN KÉO CO CONTROLLER CLASS
  class TugGameController {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.sound = new TugSoundEngine();

      this.teams = [
        { name: options.teamAName || 'Đội A', color: options.teamAColor || '#3b82f6' },
        { name: options.teamBName || 'Đội B', color: options.teamBColor || '#ef4444' }
      ];

      this.questions = this.normalizeQuestions(options.questions || []);
      this.rules = {
        pull: options.pull || 1,
        winDistance: Math.max(2, Math.min(6, options.winDistance || 4)),
        secondsPerQuestion: options.secondsPerQuestion || 30
      };

      this.inputMode = options.inputMode || localStorage.getItem('gameInputMode') || 'touch'; // touch | projector
      
      // Zoom levels for font size
      this.zoomLevels = [
        { q: '18px', opt: '15px' },
        { q: '22px', opt: '18px' },
        { q: '26px', opt: '20px' },
        { q: '30px', opt: '22px' },
        { q: '34px', opt: '24px' }
      ];
      this.currentZoomIdx = parseInt(localStorage.getItem('keoco_font_zoom') || '1', 10);
      if (isNaN(this.currentZoomIdx) || this.currentZoomIdx < 0 || this.currentZoomIdx >= this.zoomLevels.length) {
        this.currentZoomIdx = 1; // Default 22px / 18px
      }

      // Game State
      this.state = {
        phase: 'setup', // setup | countdown | answering | moving | finished
        knot: 0,        // -winDistance (A wins) to +winDistance (B wins)
        qIndex: 0,
        moKhoa: 'ca-hai', // 'ca-hai' | 0 (Team A) | 1 (Team B)
        soLanSai: 0,
        winner: null,
        lastDelta: 0,
        lastCorrect: null,
        lastPresser: null
      };

      this.isPaused = false;
      this.timerRemaining = this.rules.secondsPerQuestion;
      this.timerInterval = null;
      this.currentToast = null;
      this.keyboardListener = this.handleKeyDown.bind(this);

      injectStyles();
      this.initDom();
    }

    normalizeQuestions(raw) {
      if (Array.isArray(raw) && raw.length > 0) return raw;
      return [
        {
          text: "8 + 7 = ?",
          options: ["15", "13", "16", "14"],
          correctIndex: 0
        },
        {
          text: "Con gì tám cẳng hai càng, chẳng đi mà lại bò ngang suốt đời?",
          options: ["Con cua", "Con tôm", "Con nhện", "Con ghẹ"],
          correctIndex: 0
        },
        {
          text: "56 : 8 = ?",
          options: ["6", "9", "8", "7"],
          correctIndex: 2
        },
        {
          text: "Chia đều 96 quyển vở cho 4 lớp. Mỗi lớp nhận được bao nhiêu quyển?",
          options: ["22 quyển", "26 quyển", "24 quyển", "28 quyển"],
          correctIndex: 2
        },
        {
          text: "Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là gì?",
          options: ["TP. Hồ Chí Minh", "Đà Nẵng", "Hà Nội", "Hải Phòng"],
          correctIndex: 2
        },
        {
          text: "Kim loại nào sau đây có khả năng dẫn điện tốt nhất?",
          options: ["Đồng", "Nhôm", "Bạc", "Vàng"],
          correctIndex: 2
        },
        {
          text: "Tháng nào trong năm dương lịch có số ngày ít nhất?",
          options: ["Tháng 1", "Tháng 2", "Tháng 4", "Tháng 11"],
          correctIndex: 1
        },
        {
          text: "Từ nào sau đây viết đúng chính tả tiếng Việt?",
          options: ["Suôn sẻ", "Xuôn xẻ", "Suôn xẻ", "Xuôn sẻ"],
          correctIndex: 0
        }
      ];
    }

    initDom() {
      this.container.innerHTML = `
        <div class="tug-stage" id="tug-root">
          <!-- Top Control Header -->
          <header class="tug-head" style="position: relative; z-index: 40; display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; background: rgba(255,255,255,0.95); border-bottom: 2px solid #e2e8f0; backdrop-filter: blur(8px); box-shadow: 0 2px 10px rgba(0,0,0,0.06);">
            <!-- Team Info Cards -->
            <div style="display: flex; gap: 14px; flex: 1; max-width: 650px;">
              <!-- Left Team Card -->
              <div id="tug-team-badge-0" style="flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; border-radius: 14px; border: 2.5px solid ${this.teams[0].color}; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: all 0.25s;">
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                  <span style="width: 14px; height: 14px; border-radius: 50%; background: ${this.teams[0].color}; box-shadow: 0 0 10px ${this.teams[0].color};"></span>
                  <span id="tug-team-name-0" style="font-weight: 900; font-size: 15px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.teams[0].name}</span>
                </div>
                <span id="tug-team-status-0" style="font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 9999px; background: #fef08a; color: #854d0e; white-space: nowrap;">⚡ NHANH TAY</span>
              </div>

              <!-- Right Team Card -->
              <div id="tug-team-badge-1" style="flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; border-radius: 14px; border: 2.5px solid ${this.teams[1].color}; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.05); transition: all 0.25s;">
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                  <span style="width: 14px; height: 14px; border-radius: 50%; background: ${this.teams[1].color}; box-shadow: 0 0 10px ${this.teams[1].color};"></span>
                  <span id="tug-team-name-1" style="font-weight: 900; font-size: 15px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.teams[1].name}</span>
                </div>
                <span id="tug-team-status-1" style="font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 9999px; background: #fef08a; color: #854d0e; white-space: nowrap;">⚡ NHANH TAY</span>
              </div>
            </div>

            <!-- Top Toolbar Buttons -->
            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="tug-btn-fs" title="Toàn màn hình" style="width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">⛶</button>
              <button id="tug-btn-sound" title="Âm thanh" style="width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">🔊</button>
              <button id="tug-btn-pause" title="Tạm dừng / Tiếp tục" style="padding: 0 14px; height: 38px; border-radius: 10px; border: 1.5px solid #cbd5e1; background: #fff; font-size: 13px; font-weight: 800; color: #334155; cursor: pointer; transition: all 0.2s;">Tạm dừng</button>
              <button id="tug-btn-exit" title="Kết thúc trận đấu" style="padding: 0 14px; height: 38px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fee2e2; color: #b91c1c; font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.2s;">Kết thúc</button>
            </div>
          </header>

          <!-- Question Banner -->
          <div id="tug-qbar" class="tug-qbar" style="display: none; position: relative; z-index: 30; width: min(1200px, 96%); margin: 10px auto 0; padding: 12px 24px; background: rgba(255,255,255,0.96); border-radius: 18px; border: 2px solid #e2e8f0; backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
            <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;">
              <span id="tug-qbar-num" class="tug-qbar__num" style="display: inline-flex; align-items: center; justify-content: center; height: 32px; padding: 0 14px; border-radius: 8px; background: #047857; color: #fff; font-size: 13px; font-weight: 900; letter-spacing: 0.5px; white-space: nowrap; text-transform: uppercase;">CÂU 1</span>
              
              <!-- Question Text & Image Container -->
              <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0;">
                <span id="tug-qbar-text" class="tug-qbar__text" style="font-size: var(--tug-q-fs, 22px); font-weight: 800; color: #0f172a; line-height: 1.35;"></span>
                <img id="tug-qbar-image" src="" alt="Hình minh họa" style="display: none; max-height: 85px; max-width: 220px; border-radius: 8px; border: 1.5px solid #cbd5e1; cursor: pointer; object-fit: contain; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              </div>
            </div>

            <!-- Right: Font Controls (A-, A+) & Timer Ring -->
            <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
              <!-- Font Controls A-, A+ -->
              <div style="display: flex; gap: 4px; background: #f1f5f9; border-radius: 8px; padding: 3px; border: 1px solid #e2e8f0;">
                <button type="button" id="tug-btn-font-dec" title="Thu nhỏ cỡ chữ (A-)" style="width: 32px; height: 30px; border-radius: 6px; border: none; background: #fff; font-size: 13px; font-weight: 900; color: #334155; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">A-</button>
                <button type="button" id="tug-btn-font-inc" title="Phóng to cỡ chữ (A+)" style="width: 32px; height: 30px; border-radius: 6px; border: none; background: #fff; font-size: 14px; font-weight: 900; color: #334155; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">A+</button>
              </div>

              <!-- Timer Ring -->
              <div id="tug-timer" class="tug-timer" style="position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;">
                <svg viewBox="0 0 54 54" class="tug-timer__svg" style="position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg);">
                  <circle cx="27" cy="27" r="21" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="5"></circle>
                  <circle id="tug-timer-circle" cx="27" cy="27" r="21" fill="none" stroke="#0e9488" stroke-width="5" stroke-linecap="round" stroke-dasharray="131.95" stroke-dashoffset="0" style="transition: stroke-dashoffset 0.2s linear;"></circle>
                </svg>
                <span id="tug-timer-num" class="tug-timer__num" style="position: relative; font-size: 18px; font-weight: 900; color: #0f172a;">30</span>
              </div>
            </div>
          </div>

          <!-- Arena Field -->
          <div class="tug-field" style="position: relative; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
            <div class="tug-scene" id="tug-scene" style="--tug-row-w: 86vw; --tug-bow-x: 50.5vw; --tug-travel: 7vw;">
              <!-- 16 Character Row Sprite Image -->
              <div class="tug-row" id="tug-sprite-row" style="position: absolute; width: var(--tug-row-w); left: 50%; bottom: calc(var(--tug-chan) - var(--tug-le-duoi)); pointer-events: none; z-index: 10;">
                <img src="/ey/games/tug/tug-full-row.webp?v=3" alt="" class="tug-row__img" style="width: 100%; height: auto; display: block;">
              </div>

              <!-- Goal Markers & Flags (Exact from Video) -->
              <div class="tug-goals" aria-hidden="true" style="position: absolute; inset: 0; pointer-events: none; z-index: 12;">
                <!-- Center Line: Dashed white vertical line -->
                <div style="position: absolute; left: 50.5vw; top: 12%; bottom: calc(var(--tug-chan) - 1vw); width: 2.5px; transform: translateX(-50%); background: repeating-linear-gradient(180deg, #ffffff 0, #ffffff 10px, transparent 10px, transparent 20px); opacity: 0.95;"></div>

                <!-- Left Goal (Team A): Blue vertical dashed line with blue triangular flag -->
                <div id="tug-goal-l" style="position: absolute; left: calc(50.5vw - 7vw); top: 12%; bottom: calc(var(--tug-chan) - 1vw); width: 2.5px; transform: translateX(-50%); background: repeating-linear-gradient(180deg, ${this.teams[0].color} 0, ${this.teams[0].color} 10px, transparent 10px, transparent 20px); opacity: 0.95;">
                  <span style="position: absolute; top: -16px; left: 0; width: 20px; height: 14px; background: ${this.teams[0].color}; clip-path: polygon(0 0, 100% 50%, 0 100%);"></span>
                </div>

                <!-- Right Goal (Team B): Red vertical dashed line with red triangular flag -->
                <div id="tug-goal-r" style="position: absolute; left: calc(50.5vw + 7vw); top: 12%; bottom: calc(var(--tug-chan) - 1vw); width: 2.5px; transform: translateX(-50%); background: repeating-linear-gradient(180deg, ${this.teams[1].color} 0, ${this.teams[1].color} 10px, transparent 10px, transparent 20px); opacity: 0.95;">
                  <span style="position: absolute; top: -16px; right: 0; width: 20px; height: 14px; background: ${this.teams[1].color}; clip-path: polygon(100% 0, 0 50%, 100% 100%);"></span>
                </div>
              </div>
            </div>

            <!-- Answer Pads (Left & Right - 2x2 Grid with Blue & Red Bounding Boxes) -->
            <div class="tug-pads" id="tug-pads" style="display: none; position: relative; z-index: 25; padding: 12px 24px; gap: 28px; margin-top: auto; max-width: 1400px; width: 100%; margin-left: auto; margin-right: auto;">
              <!-- Left Team Pad (Đội A - Blue bounding frame) -->
              <div id="tug-pad-l" style="flex: 1; border: 3.5px solid ${this.teams[0].color}; border-radius: 24px; background: rgba(238, 242, 255, 0.85); padding: 10px; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.12); backdrop-filter: blur(8px); transition: all 0.25s;">
                <div id="tug-grid-l" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"></div>
              </div>

              <!-- Right Team Pad (Đội B - Red bounding frame) -->
              <div id="tug-pad-r" style="flex: 1; border: 3.5px solid ${this.teams[1].color}; border-radius: 24px; background: rgba(254, 242, 242, 0.85); padding: 10px; box-shadow: 0 8px 24px rgba(220, 38, 38, 0.12); backdrop-filter: blur(8px); transition: all 0.25s;">
                <div id="tug-grid-r" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"></div>
              </div>
            </div>
          </div>

          <!-- Toast Alert Overlay (Always centered in view) -->
          <div id="tug-toast" class="tug-toast" style="display: none;"></div>

          <!-- Setup Dialog Overlay -->
          <div id="tug-setup" class="tug-start" style="position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);">
            <div class="tug-start__card" style="width: min(540px, 92%); background: #ffffff; border-radius: 28px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); text-align: center;">
              <h1 class="tug-start__title" style="font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 24px;">Thiết lập trận đấu</h1>
              
              <!-- Team Names & Color VS -->
              <div class="tug-start__vs" style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 26px;">
                <div style="flex: 1;">
                  <input type="text" id="tug-input-team-0" value="${this.teams[0].name}" maxlength="16" placeholder="Đội TRÁI" style="width: 100%; height: 48px; border-radius: 12px; border: 2.5px solid ${this.teams[0].color}; padding: 0 14px; font-size: 16px; font-weight: 800; text-align: center; color: #0f172a; outline: none; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                </div>
                <span class="tug-start__x" style="font-size: 20px; font-weight: 900; color: #94a3b8;">VS</span>
                <div style="flex: 1;">
                  <input type="text" id="tug-input-team-1" value="${this.teams[1].name}" maxlength="16" placeholder="Đội PHẢI" style="width: 100%; height: 48px; border-radius: 12px; border: 2.5px solid ${this.teams[1].color}; padding: 0 14px; font-size: 16px; font-weight: 800; text-align: center; color: #0f172a; outline: none; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                </div>
              </div>

              <!-- Input Mode Picker -->
              <div class="game-inputmode" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 16px; margin-bottom: 26px; text-align: left;">
                <p class="game-inputmode__label" style="font-size: 13.5px; font-weight: 800; color: #334155; margin-bottom: 10px;">Học sinh bấm bằng gì?</p>
                <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                  <button type="button" id="tug-mode-touch" class="game-inputmode__btn ${this.inputMode === 'touch' ? 'is-on' : ''}" style="flex: 1; height: 42px; border-radius: 10px; border: 1.5px solid ${this.inputMode === 'touch' ? '#0d9488' : '#cbd5e1'}; background: ${this.inputMode === 'touch' ? '#ccfbf1' : '#fff'}; color: ${this.inputMode === 'touch' ? '#0f766e' : '#475569'}; font-size: 14px; font-weight: 800; cursor: pointer;">📺 Tivi cảm ứng</button>
                  <button type="button" id="tug-mode-projector" class="game-inputmode__btn ${this.inputMode === 'projector' ? 'is-on' : ''}" style="flex: 1; height: 42px; border-radius: 10px; border: 1.5px solid ${this.inputMode === 'projector' ? '#0d9488' : '#cbd5e1'}; background: ${this.inputMode === 'projector' ? '#ccfbf1' : '#fff'}; color: ${this.inputMode === 'projector' ? '#0f766e' : '#475569'}; font-size: 14px; font-weight: 800; cursor: pointer;">⌨️ Bàn phím</button>
                </div>
                <p id="tug-mode-hint" class="game-inputmode__hint" style="font-size: 12px; color: #64748b; margin: 0;">${this.inputMode === 'projector' ? 'Đội trái bấm Q W E R, đội phải bấm U I O P — ký tự phím in sẵn trên từng đáp án.' : 'Học sinh chạm thẳng vào đáp án trên màn hình.'}</p>
              </div>

              <div class="tug-start__actions">
                <button type="button" id="tug-btn-start" class="tug-btn tug-btn--primary tug-btn--big" style="width: 100%; height: 54px; border-radius: 16px; border: none; background: linear-gradient(135deg, #0d9488 0%, #047857 100%); color: #fff; font-size: 18px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 18px rgba(13, 148, 136, 0.45); transition: transform 0.15s, filter 0.15s;">▶ Bắt đầu</button>
              </div>
            </div>
          </div>

          <!-- Countdown 3-2-1 Overlay -->
          <div id="tug-countdown" style="display: none; position: absolute; inset: 0; z-index: 60; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);">
            <div id="tug-countdown-text" style="font-size: 140px; font-weight: 900; color: #e11d48; text-shadow: 0 8px 30px rgba(0,0,0,0.6); animation: tug-pop-flow 0.8s ease;">3</div>
          </div>

          <!-- Image Lightbox Modal -->
          <div id="tug-lightbox" style="display: none; position: fixed; inset: 0; z-index: 100; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); backdrop-filter: blur(6px); cursor: pointer;">
            <img id="tug-lightbox-img" src="" alt="Zoom" style="max-width: 90vw; max-height: 85vh; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);">
          </div>

          <!-- Victory / Finish Modal Overlay -->
          <div id="tug-finish-modal" class="tug-finish" style="display: none; position: fixed; inset: 0; z-index: 70; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(8px);">
            <canvas id="tug-confetti-canvas" class="tug-confetti-canvas" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;"></canvas>
            <div class="tug-finish__card" id="tug-finish-card" style="position: relative; z-index: 10; width: min(600px, 92vw); background: #ffffff; border: 4px solid #facc15; border-radius: 32px; padding: 36px 28px; text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.5);">
              <div class="tug-finish__emoji" style="font-size: 72px; line-height: 1; margin-bottom: 12px;">🏆</div>
              <h2 class="tug-finish__title" id="tug-finish-title" style="font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 10px;">Đội A Chiến Thắng!</h2>
              <p id="tug-finish-desc" style="font-size: 15px; color: #64748b; font-weight: 600; margin-bottom: 28px;">Đã xuất sắc kéo sợi dây qua vạch đích bằng kiến thức vượt trội!</p>
              <div class="tug-finish__actions" style="display: flex; gap: 14px; justify-content: center;">
                <button type="button" id="tug-btn-restart" style="padding: 12px 28px; border-radius: 14px; border: none; background: #0d9488; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(13,148,136,0.35);">Chơi lại</button>
                <button type="button" id="tug-btn-finish-exit" style="padding: 12px 28px; border-radius: 14px; border: 1.5px solid #cbd5e1; background: #f8fafc; color: #475569; font-size: 15px; font-weight: 800; cursor: pointer;">Về danh sách</button>
              </div>
            </div>
          </div>
        </div>
      `;

      this.applyFontZoom();
      this.bindEvents();
      this.updateVisualPositions();
    }

    applyFontZoom() {
      const zoom = this.zoomLevels[this.currentZoomIdx];
      const root = document.getElementById('tug-root');
      if (root) {
        root.style.setProperty('--tug-q-fs', zoom.q);
        root.style.setProperty('--tug-opt-fs', zoom.opt);
      }
      try { localStorage.setItem('keoco_font_zoom', String(this.currentZoomIdx)); } catch (e) {}
    }

    updateVisualPositions() {
      const H = this.state.knot / this.rules.winDistance; // -1.0 to +1.0
      const spriteRow = document.getElementById('tug-sprite-row');
      const goalL = document.getElementById('tug-goal-l');
      const goalR = document.getElementById('tug-goal-r');

      if (spriteRow) {
        spriteRow.style.setProperty('--tug-row-shift', `${7 * H}vw`);
        spriteRow.style.transform = `translateX(calc(-50% + ${7 * H}vw))`;
        spriteRow.style.transition = 'transform 0.74s cubic-bezier(0.22, 1, 0.36, 1)';
      }
      if (goalL) goalL.classList.toggle('is-reached', H <= -0.999);
      if (goalR) goalR.classList.toggle('is-reached', H >= 0.999);
    }

    bindEvents() {
      // Font zoom buttons A- and A+
      document.getElementById('tug-btn-font-dec')?.addEventListener('click', () => {
        if (this.currentZoomIdx > 0) {
          this.currentZoomIdx--;
          this.applyFontZoom();
        }
      });
      document.getElementById('tug-btn-font-inc')?.addEventListener('click', () => {
        if (this.currentZoomIdx < this.zoomLevels.length - 1) {
          this.currentZoomIdx++;
          this.applyFontZoom();
        }
      });

      // Question image lightbox
      const qImg = document.getElementById('tug-qbar-image');
      const lightbox = document.getElementById('tug-lightbox');
      const lightboxImg = document.getElementById('tug-lightbox-img');
      qImg?.addEventListener('click', () => {
        if (lightbox && lightboxImg && qImg.src) {
          lightboxImg.src = qImg.src;
          lightbox.style.display = 'flex';
        }
      });
      lightbox?.addEventListener('click', () => {
        lightbox.style.display = 'none';
      });

      // Input mode toggles
      const touchBtn = document.getElementById('tug-mode-touch');
      const projBtn = document.getElementById('tug-mode-projector');
      const modeHint = document.getElementById('tug-mode-hint');

      touchBtn?.addEventListener('click', () => {
        this.inputMode = 'touch';
        touchBtn.className = 'game-inputmode__btn is-on';
        projBtn.className = 'game-inputmode__btn';
        touchBtn.style.border = '1.5px solid #0d9488';
        touchBtn.style.background = '#ccfbf1';
        touchBtn.style.color = '#0f766e';
        projBtn.style.border = '1.5px solid #cbd5e1';
        projBtn.style.background = '#fff';
        projBtn.style.color = '#475569';
        modeHint.textContent = 'Học sinh chạm thẳng vào đáp án trên màn hình.';
        try { localStorage.setItem('gameInputMode', 'touch'); } catch (e) {}
        this.renderCurrentQuestion();
      });

      projBtn?.addEventListener('click', () => {
        this.inputMode = 'projector';
        projBtn.className = 'game-inputmode__btn is-on';
        touchBtn.className = 'game-inputmode__btn';
        projBtn.style.border = '1.5px solid #0d9488';
        projBtn.style.background = '#ccfbf1';
        projBtn.style.color = '#0f766e';
        touchBtn.style.border = '1.5px solid #cbd5e1';
        touchBtn.style.background = '#fff';
        touchBtn.style.color = '#475569';
        modeHint.textContent = 'Đội trái bấm Q W E R, đội phải bấm U I O P — ký tự phím in sẵn trên từng đáp án.';
        try { localStorage.setItem('gameInputMode', 'projector'); } catch (e) {}
        this.renderCurrentQuestion();
      });

      // Start button
      document.getElementById('tug-btn-start')?.addEventListener('click', () => {
        const name0 = document.getElementById('tug-input-team-0')?.value.trim();
        const name1 = document.getElementById('tug-input-team-1')?.value.trim();
        if (name0) this.teams[0].name = name0;
        if (name1) this.teams[1].name = name1;

        document.getElementById('tug-team-name-0').textContent = this.teams[0].name;
        document.getElementById('tug-team-name-1').textContent = this.teams[1].name;

        document.getElementById('tug-setup').style.display = 'none';
        this.startCountdown();
      });

      // Top bar buttons
      document.getElementById('tug-btn-fs')?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      });

      const soundBtn = document.getElementById('tug-btn-sound');
      soundBtn?.addEventListener('click', () => {
        this.sound.enabled = !this.sound.enabled;
        soundBtn.textContent = this.sound.enabled ? '🔊' : '🔇';
      });

      const pauseBtn = document.getElementById('tug-btn-pause');
      pauseBtn?.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        pauseBtn.textContent = this.isPaused ? 'Tiếp tục' : 'Tạm dừng';
        pauseBtn.style.background = this.isPaused ? '#10b981' : '#fff';
        pauseBtn.style.color = this.isPaused ? '#fff' : '#334155';
      });

      document.getElementById('tug-btn-exit')?.addEventListener('click', () => {
        if (confirm("Kết thúc trận đấu bây giờ? Nơ chưa qua vạch thì trận hòa – kéo hơn vài nấc chưa phải là thắng.")) {
          this.endMatch();
        }
      });

      document.getElementById('tug-btn-restart')?.addEventListener('click', () => {
        this.restartMatch();
      });

      document.getElementById('tug-btn-finish-exit')?.addEventListener('click', () => {
        if (typeof this.options.onExit === 'function') {
          this.options.onExit();
        }
      });

      // Keyboard listeners
      window.addEventListener('keydown', this.keyboardListener);
    }

    startCountdown() {
      const overlay = document.getElementById('tug-countdown');
      const text = document.getElementById('tug-countdown-text');
      if (!overlay || !text) return;

      overlay.style.display = 'flex';
      let count = 3;
      text.textContent = String(count);
      this.sound.play('whistle');

      const cdInterval = setInterval(() => {
        count--;
        if (count > 0) {
          text.textContent = String(count);
          text.style.animation = 'none';
          void text.offsetWidth;
          text.style.animation = 'tug-pop-flow 0.8s ease';
          this.sound.play('tick');
        } else {
          clearInterval(cdInterval);
          overlay.style.display = 'none';
          this.startAnswering();
        }
      }, 900);
    }

    startAnswering() {
      this.state.phase = 'answering';
      this.state.moKhoa = 'ca-hai';
      this.state.soLanSai = 0;
      this.timerRemaining = this.rules.secondsPerQuestion;

      document.getElementById('tug-qbar').style.display = 'flex';
      document.getElementById('tug-pads').style.display = 'flex';

      this.renderCurrentQuestion();
      this.updateTeamStatusBadges();
      this.startTimer();
    }

    renderCurrentQuestion() {
      const q = this.questions[this.state.qIndex % this.questions.length];
      const qNumEl = document.getElementById('tug-qbar-num');
      const qTextEl = document.getElementById('tug-qbar-text');
      const qImgEl = document.getElementById('tug-qbar-image');

      if (qNumEl) qNumEl.textContent = `CÂU ${this.state.qIndex + 1}`;
      if (qTextEl) qTextEl.textContent = q.text || q.content || '';

      // Image in question
      if (qImgEl) {
        if (q.image) {
          qImgEl.src = q.image;
          qImgEl.style.display = 'inline-block';
        } else {
          qImgEl.src = '';
          qImgEl.style.display = 'none';
        }
      }

      // Render Left & Right options in 2x2 grid
      const gridL = document.getElementById('tug-grid-l');
      const gridR = document.getElementById('tug-grid-r');

      const keyL = ['Q', 'W', 'E', 'R'];
      const keyR = ['U', 'I', 'O', 'P'];
      const letters = ['A', 'B', 'C', 'D'];

      const makeButtons = (teamIdx, keys) => {
        const team = this.teams[teamIdx];
        return q.options.map((opt, idx) => {
          const optText = typeof opt === 'object' ? (opt.text || opt.content || '') : String(opt);
          const letter = letters[idx];
          const keyBadge = this.inputMode === 'projector' ? `<kbd class="tug-pad__key" style="margin-left: auto; font-size: 12px; padding: 2px 7px; border-radius: 6px; border: 1.5px solid #cbd5e1; background: #f8fafc; font-family: system-ui, sans-serif; font-weight: 800; color: #475569;">${keys[idx]}</kbd>` : '';
          return `
            <button type="button" class="tug-pad__btn" data-team="${teamIdx}" data-choice="${idx}" style="display: flex; align-items: center; min-height: 58px; height: auto; padding: 6px 14px; border-radius: 14px; border: 1.5px solid #e2e8f0; background: #ffffff; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
              <span class="tug-pad__letter-circle" style="display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: ${team.color}; color: #ffffff; font-size: 16px; font-weight: 900; margin-right: 12px; flex-shrink: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">${letter}</span>
              <span class="tug-pad__text" style="flex: 1; font-size: var(--tug-opt-fs, 17px); font-weight: 800; color: #0f172a; text-align: left; line-height: 1.35; overflow-wrap: anywhere; white-space: normal;">${optText}</span>
              ${keyBadge}
            </button>
          `;
        }).join('');
      };

      if (gridL) {
        gridL.innerHTML = makeButtons(0, keyL);
        gridL.querySelectorAll('.tug-pad__btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const choice = parseInt(btn.dataset.choice, 10);
            this.handleAnswer(0, choice);
          });
        });
      }

      if (gridR) {
        gridR.innerHTML = makeButtons(1, keyR);
        gridR.querySelectorAll('.tug-pad__btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const choice = parseInt(btn.dataset.choice, 10);
            this.handleAnswer(1, choice);
          });
        });
      }

      if (window.FileParser && typeof window.FileParser.renderMath === 'function') {
        if (qTextEl) window.FileParser.renderMath(qTextEl);
        if (gridL) window.FileParser.renderMath(gridL);
        if (gridR) window.FileParser.renderMath(gridR);
      }

      this.updatePadsInteractiveState();
    }

    updatePadsInteractiveState() {
      const padL = document.getElementById('tug-pad-l');
      const padR = document.getElementById('tug-pad-r');

      const isAAllowed = this.state.phase === 'answering' && (this.state.moKhoa === 'ca-hai' || this.state.moKhoa === 0);
      const isBAllowed = this.state.phase === 'answering' && (this.state.moKhoa === 'ca-hai' || this.state.moKhoa === 1);

      if (padL) {
        padL.style.opacity = isAAllowed ? '1' : '0.4';
        padL.style.pointerEvents = isAAllowed ? 'auto' : 'none';
        padL.querySelectorAll('.tug-pad__btn').forEach(b => b.disabled = !isAAllowed);
      }
      if (padR) {
        padR.style.opacity = isBAllowed ? '1' : '0.4';
        padR.style.pointerEvents = isBAllowed ? 'auto' : 'none';
        padR.querySelectorAll('.tug-pad__btn').forEach(b => b.disabled = !isBAllowed);
      }
    }

    updateTeamStatusBadges() {
      const badge0 = document.getElementById('tug-team-badge-0');
      const badge1 = document.getElementById('tug-team-badge-1');
      const status0 = document.getElementById('tug-team-status-0');
      const status1 = document.getElementById('tug-team-status-1');

      if (!status0 || !status1) return;

      if (this.state.moKhoa === 'ca-hai') {
        status0.textContent = "⚡ NHANH TAY";
        status0.style.background = "#fef08a";
        status0.style.color = "#854d0e";
        status1.textContent = "⚡ NHANH TAY";
        status1.style.background = "#fef08a";
        status1.style.color = "#854d0e";
        badge0?.classList.add('game-turn-pulse');
        badge1?.classList.add('game-turn-pulse');
      } else if (this.state.moKhoa === 0) {
        status0.textContent = "▶ TRẢ LỜI";
        status0.style.background = "#bbf7d0";
        status0.style.color = "#166534";
        status1.textContent = "✋ BỊ CẤM";
        status1.style.background = "#e2e8f0";
        status1.style.color = "#64748b";
        badge0?.classList.add('game-turn-pulse');
        badge1?.classList.remove('game-turn-pulse');
      } else if (this.state.moKhoa === 1) {
        status0.textContent = "✋ BỊ CẤM";
        status0.style.background = "#e2e8f0";
        status0.style.color = "#64748b";
        status1.textContent = "▶ TRẢ LỜI";
        status1.style.background = "#bbf7d0";
        status1.style.color = "#166534";
        badge0?.classList.remove('game-turn-pulse');
        badge1?.classList.add('game-turn-pulse');
      }
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      const timerCircle = document.getElementById('tug-timer-circle');
      const timerNum = document.getElementById('tug-timer-num');
      const circumference = 2 * Math.PI * 21; // ~131.95

      this.timerInterval = setInterval(() => {
        if (this.isPaused || this.state.phase !== 'answering') return;
        this.timerRemaining -= 0.2;

        if (this.timerRemaining <= 0) {
          this.timerRemaining = 0;
          clearInterval(this.timerInterval);
          this.handleTimeout();
        }

        const secInt = Math.ceil(this.timerRemaining);
        if (timerNum) timerNum.textContent = String(secInt);

        const fraction = Math.max(0, this.timerRemaining / this.rules.secondsPerQuestion);
        if (timerCircle) {
          timerCircle.style.strokeDashoffset = String(circumference * (1 - fraction));
          if (this.timerRemaining <= 5.5) {
            timerCircle.setAttribute('stroke', '#ef4444');
          } else {
            timerCircle.setAttribute('stroke', '#0e9488');
          }
        }

        // Tick audio on last 5 seconds
        if (secInt <= 5 && secInt > 0 && Math.abs(this.timerRemaining - secInt) < 0.15) {
          this.sound.play('tick');
        }
      }, 200);
    }

    showToast(message, type = 'good', duration = 2000) {
      const toastEl = document.getElementById('tug-toast');
      if (!toastEl) return;
      toastEl.className = `tug-toast is-${type}`;
      toastEl.innerHTML = `<p class="tug-toast__text" style="font-size: 19px; font-weight: 800; color: #0f172a; margin: 0;">${message}</p>`;
      const borderColor = type === 'good' ? '#10b981' : (type === 'bad' ? '#ef4444' : '#f59e0b');
      toastEl.style.cssText = `position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%); z-index: 60; display: inline-flex; align-items: center; justify-content: center; padding: 14px 36px; border-radius: 9999px; background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(8px); border: 2.5px solid ${borderColor}; box-shadow: 0 16px 36px rgba(0,0,0,0.25); pointer-events: none; animation: tug-pop-flow 0.3s ease;`;

      if (this.currentToast?.timer) clearTimeout(this.currentToast.timer);
      this.currentToast = {
        timer: setTimeout(() => {
          toastEl.style.display = 'none';
        }, duration)
      };
    }

    handleAnswer(teamIdx, choiceIdx) {
      if (this.state.phase !== 'answering') return;
      if (this.state.moKhoa !== 'ca-hai' && this.state.moKhoa !== teamIdx) return;

      const q = this.questions[this.state.qIndex % this.questions.length];
      const correctIdx = typeof q.correctIndex === 'number' ? q.correctIndex : (q.correctAnswer ? ('ABCD'.indexOf(q.correctAnswer)) : 0);
      const isCorrect = choiceIdx === correctIdx;
      const team = this.teams[teamIdx];
      const otherTeam = this.teams[1 - teamIdx];

      // Highlight the pressed button
      const grid = document.getElementById(teamIdx === 0 ? 'tug-grid-l' : 'tug-grid-r');
      const btn = grid?.querySelector(`[data-choice="${choiceIdx}"]`);
      if (btn) {
        btn.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
      }

      if (isCorrect) {
        // CORRECT ANSWER
        this.sound.play('correct');
        this.showToast(`<span class="tug-toast__name" style="color: ${team.color};">${team.name}</span> nhanh tay — <span class="tug-toast__action" style="color: #059669; font-weight: 900;">ĐÚNG! Kéo!</span>`, 'good', 1800);

        this.state.phase = 'moving';
        this.state.lastDelta = teamIdx === 0 ? -this.rules.pull : this.rules.pull;
        this.state.knot = Math.max(-this.rules.winDistance, Math.min(this.rules.winDistance, this.state.knot + this.state.lastDelta));

        this.triggerMoveAnimation(teamIdx);

        setTimeout(() => {
          this.checkWinOrNextQuestion();
        }, 1200);

      } else {
        // WRONG ANSWER
        this.sound.play('wrong');
        this.state.soLanSai++;

        if (this.state.soLanSai >= 2) {
          // Both teams failed or reached max errors
          const letters = ['A', 'B', 'C', 'D'];
          this.showToast(`<span class="tug-toast__wrong" style="color: #dc2626; font-weight: 900;">Hết lượt trả lời</span> — đáp án đúng là <span class="tug-toast__action" style="color: #059669; font-weight: 900;">${letters[correctIdx]}</span>. Sang câu mới!`, 'bad', 2200);

          setTimeout(() => {
            this.nextQuestion();
          }, 2200);
        } else {
          // Transfer to other team
          this.state.moKhoa = 1 - teamIdx;
          this.showToast(`<span class="tug-toast__name" style="color: ${team.color};">${team.name}</span> <span class="tug-toast__wrong" style="color: #dc2626; font-weight: 900;">trả lời sai</span> — câu này chuyển cho <span class="tug-toast__name" style="color: ${otherTeam.color};">${otherTeam.name}</span>, còn 2 lượt!`, 'bad', 2000);

          this.updateTeamStatusBadges();
          this.updatePadsInteractiveState();
        }
      }
    }

    handleTimeout() {
      this.sound.play('thud');
      const q = this.questions[this.state.qIndex % this.questions.length];
      const correctIdx = typeof q.correctIndex === 'number' ? q.correctIndex : (q.correctAnswer ? ('ABCD'.indexOf(q.correctAnswer)) : 0);
      const letters = ['A', 'B', 'C', 'D'];

      if (this.state.moKhoa === 'ca-hai') {
        this.showToast(`<span class="tug-toast__warn" style="color: #d97706; font-weight: 900;">Hết giờ</span> — chuyển sang câu mới! Đáp án là <span class="tug-toast__action" style="color: #059669; font-weight: 900;">${letters[correctIdx]}</span>`, 'bad', 2000);
        setTimeout(() => this.nextQuestion(), 2000);
      } else {
        this.showToast(`<span class="tug-toast__warn" style="color: #d97706; font-weight: 900;">Hết giờ</span> — đáp án đúng là <span class="tug-toast__action" style="color: #059669; font-weight: 900;">${letters[correctIdx]}</span>. Sang câu mới!`, 'bad', 2000);
        setTimeout(() => this.nextQuestion(), 2000);
      }
    }

    triggerMoveAnimation(pullingTeamIdx) {
      this.sound.play('pull');
      this.updateVisualPositions();

      const spriteRow = document.getElementById('tug-sprite-row');
      spriteRow?.classList.add('is-moving');

      // Play crowd cheer if near goal
      if (Math.abs(this.state.knot) >= this.rules.winDistance - 1) {
        this.sound.play('crowd', { intensity: 1 });
      }

      setTimeout(() => {
        this.sound.play('thud');
        spriteRow?.classList.remove('is-moving');
      }, 700);
    }

    checkWinOrNextQuestion() {
      if (this.state.knot <= -this.rules.winDistance) {
        // Team A wins
        this.finishMatch(0);
      } else if (this.state.knot >= this.rules.winDistance) {
        // Team B wins
        this.finishMatch(1);
      } else if (this.state.qIndex + 1 >= this.questions.length) {
        // Finished all questions
        if (this.state.knot < 0) this.finishMatch(0);
        else if (this.state.knot > 0) this.finishMatch(1);
        else this.finishMatch(null); // Draw
      } else {
        this.nextQuestion();
      }
    }

    nextQuestion() {
      this.state.qIndex++;
      this.startAnswering();
    }

    finishMatch(winnerIdx) {
      this.state.phase = 'finished';
      if (this.timerInterval) clearInterval(this.timerInterval);

      document.getElementById('tug-qbar').style.display = 'none';
      document.getElementById('tug-pads').style.display = 'none';

      this.sound.play('whistle');
      setTimeout(() => this.sound.play('fanfare'), 350);

      const modal = document.getElementById('tug-finish-modal');
      const title = document.getElementById('tug-finish-title');
      const desc = document.getElementById('tug-finish-desc');
      const card = document.getElementById('tug-finish-card');
      const canvas = document.getElementById('tug-confetti-canvas');

      if (winnerIdx !== null) {
        const winner = this.teams[winnerIdx];
        if (title) {
          title.textContent = `${winner.name} Chiến Thắng!`;
          title.style.color = winner.color;
        }
        if (card) {
          card.style.borderColor = winner.color;
        }
        if (desc) desc.textContent = `Đã xuất sắc kéo sợi dây qua vạch đích bằng kiến thức vượt trội!`;
        if (canvas) runConfetti(canvas);
      } else {
        if (title) {
          title.textContent = "Trận Đấu Hòa!";
          title.style.color = "#0f172a";
        }
        if (card) {
          card.style.borderColor = "#facc15";
        }
        if (desc) desc.textContent = "Hai đội có sức mạnh và kiến thức ngang tài ngang sức!";
      }

      if (modal) modal.style.display = 'flex';
    }

    endMatch() {
      if (this.state.knot <= -1) {
        this.finishMatch(0);
      } else if (this.state.knot >= 1) {
        this.finishMatch(1);
      } else {
        this.finishMatch(null);
      }
    }

    restartMatch() {
      this.state.knot = 0;
      this.state.qIndex = 0;
      this.state.winner = null;
      this.state.soLanSai = 0;
      this.updateVisualPositions();

      document.getElementById('tug-finish-modal').style.display = 'none';
      document.getElementById('tug-setup').style.display = 'flex';
    }

    handleKeyDown(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (this.inputMode !== 'projector') return;
      if (this.state.phase !== 'answering') return;

      const k = e.key.toLowerCase();
      const leftMap = { q: 0, w: 1, e: 2, r: 3 };
      const rightMap = { u: 0, i: 1, o: 2, p: 3 };

      if (leftMap[k] !== undefined) {
        e.preventDefault();
        this.handleAnswer(0, leftMap[k]);
      } else if (rightMap[k] !== undefined) {
        e.preventDefault();
        this.handleAnswer(1, rightMap[k]);
      } else if (e.code === 'Space') {
        e.preventDefault();
        document.getElementById('tug-btn-pause')?.click();
      }
    }

    destroy() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      window.removeEventListener('keydown', this.keyboardListener);
      this.container.innerHTML = '';
    }
  }

  // 5. GLOBAL LAUNCH FUNCTION
  global.launchKeoCoGame = function(container, options = {}) {
    const game = new TugGameController(container, options);
    return () => game.destroy();
  };

})(typeof window !== 'undefined' ? window : this);
