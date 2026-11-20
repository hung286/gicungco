// ==============================================================================
// TRÒ CHƠI XÂY NHÀ THI ĐUA (BUILD HOUSE BATTLE GAME) - 100% CHUẨN XÁC ĐỒ HỌA & CƠ CHẾ POMYAI
// Tác giả: Thầy Nguyễn Mạnh Hùng - THPT Số 1 Lào Cai (0965.908.084)
// ==============================================================================

(function(global) {
  'use strict';

  // 1. INJECT COMPLETE POMYAI CSS
  function injectStyles() {
    if (document.getElementById('pomy-builder-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'pomy-builder-styles';
    styleEl.textContent = `
      .builder-stage{z-index:60;color:#16324a;font-family:var(--font-sans);isolation:isolate;background:#9ad6f8;flex-direction:column;display:flex;position:fixed;inset:0;overflow:hidden}.bs{z-index:0;pointer-events:none;position:absolute;inset:0;overflow:hidden}.bs-world{aspect-ratio:16/9;width:max(100%,177.78vh);position:absolute;bottom:0;left:50%;transform:translate(-50%);container-type:inline-size}.bs-svg{width:100%;height:100%;display:block;position:absolute;inset:0}.bs-sun{width:0;height:0;position:absolute;top:16%;left:78.75%}.bs-sun>i{border-radius:50%;position:absolute;top:0;left:0;transform:translate(-50%,-50%)}.bs-sun__rays{background:repeating-conic-gradient(#fffbe457 0deg 3.5deg,#fffbe400 3.5deg 11deg);width:64cqw;height:64cqw;transform:translate(-50%,-50%)rotate(8deg);-webkit-mask:radial-gradient(circle,#000 0,#0000008c 22%,#0000 70%);mask:radial-gradient(circle,#000 0,#0000008c 22%,#0000 70%)}.bs-sun__halo{background:radial-gradient(circle,#fffadee6 0,#fff2c473 22%,#fff0be00 62%);width:26cqw;height:26cqw;animation:6s ease-in-out infinite bs-breathe}.bs-sun__core{background:radial-gradient(circle at 44% 40%,#fffef8 0 40%,#fff2b8 66%,#ffd766 100%);width:5.2cqw;height:5.2cqw;box-shadow:0 0 1.6cqw .5cqw #ffeeaaf2,0 0 5cqw 1.8cqw #ffe28280}@keyframes bs-spin{0%{transform:translate(-50%,-50%)rotate(0)}to{transform:translate(-50%,-50%)rotate(360deg)}}@keyframes bs-breathe{0%,to{opacity:.9;transform:translate(-50%,-50%)scale(1)}50%{opacity:1;transform:translate(-50%,-50%)scale(1.08)}}.bs-cloud{opacity:.97;animation:150s linear infinite bs-drift;position:absolute;left:0}@keyframes bs-drift{0%{transform:translate(-26cqw)}to{transform:translate(104cqw)}}.bs-cloud__svg{filter:drop-shadow(0 .5cqw .9cqw #4682c829);width:100%;height:auto;display:block}.bs-birds{width:70px;height:44px;animation:46s linear -8s infinite bs-birds;position:absolute;top:19%;left:0}@keyframes bs-birds{0%{transform:translate(-6cqw)}62%{transform:translate(106cqw,-2.4cqw)}to{transform:translate(106cqw,-2.4cqw)}}.bs-bird{fill:none;stroke:#33465f;stroke-width:2.1px;stroke-linecap:round;stroke-linejoin:round;width:20px;height:9px;animation:.42s ease-in-out infinite alternate bs-flap;position:absolute;overflow:visible}@keyframes bs-flap{0%{transform:scaleY(1)}to{transform:scaleY(-.35)translateY(-3px)}}.bs-mill{width:4cqw;height:4cqw;position:absolute;transform:translate(-50%,-50%)}.bs-mill svg{width:100%;height:100%;animation:8s linear infinite bs-rot;display:block}@keyframes bs-rot{to{transform:rotate(360deg)}}.bs-fly{width:1.9cqw;height:1.6cqw;animation:15s ease-in-out infinite bs-flutter;position:absolute}.bs-fly__body{filter:drop-shadow(0 2px 2px #0000002e);width:100%;height:100%;display:block;overflow:visible}.bs-fly__wing{transform-box:fill-box;animation:.2s ease-in-out infinite alternate bs-wing}.bs-fly__wing--l{transform-origin:100%}.bs-fly__wing--r{transform-origin:0%}@keyframes bs-wing{0%{transform:scaleX(1)}to{transform:scaleX(.22)}}@keyframes bs-flutter{0%{transform:translate(0)rotate(-6deg)}18%{transform:translate(3.4cqw,-2.6cqw)rotate(12deg)}36%{transform:translate(6.5cqw,-.8cqw)rotate(4deg)}54%{transform:translate(3.2cqw,1.6cqw)rotate(-14deg)}72%{transform:translate(-1.6cqw,-1.8cqw)rotate(-4deg)}to{transform:translate(0)rotate(-6deg)}}.bs-mote{opacity:0;background:radial-gradient(circle,#fffef0 0 35%,#fff6c800 72%);border-radius:50%;width:.42cqw;height:.42cqw;animation:12s linear infinite bs-mote;position:absolute;box-shadow:0 0 .5cqw #fff4bed9}@keyframes bs-mote{0%{opacity:0;transform:translate(0, 0) scale(var(--mz,1))}18%{opacity:.95}50%{transform:translate(1.4cqw, -4cqw) scale(var(--mz,1))}82%{opacity:.7}to{opacity:0;transform:translate(-.6cqw, -8.5cqw) scale(var(--mz,1))}}.bs-tuft{transform-origin:50% 100%;width:2.6cqw;height:2.9cqw;animation:3.6s ease-in-out infinite alternate bs-sway;position:absolute;bottom:-.3cqw}@keyframes bs-sway{0%{transform:rotate(-5deg)}to{transform:rotate(5deg)}}.bs-light{background:radial-gradient(62% 58% at 80% 12%,#fff4cd52,#fff4cd00 70%),linear-gradient(#fff0 62%,#2250141f 100%);position:absolute;inset:0}.bh{z-index:20;background:linear-gradient(#fffffff2,#ffffffdb);align-items:center;gap:12px;padding:7px 14px;display:flex;position:relative;box-shadow:0 12px 30px -20px #143c6e99}.bh:after{content:"";background:linear-gradient(90deg,#0000,#f3c14f 18%,#fff0b8 50%,#f3c14f 82%,#0000);height:2px;position:absolute;bottom:-1px;left:0;right:0}.bh-teams{scrollbar-width:none;flex:1;gap:10px;min-width:0;margin-top:-5px;padding:9px 3px 4px;display:flex;overflow-x:auto}.bh-teams::-webkit-scrollbar{display:none}.bh-team{background:linear-gradient(180deg, #fff, color-mix(in srgb, var(--c) 7%, #fff));border:1.5px solid color-mix(in srgb, var(--c) 32%, #fff);min-width:150px;box-shadow:0 6px 16px -11px color-mix(in srgb, var(--c) 70%, #0f172a), inset 0 1px 0 #fff;border-radius:12px;flex:1 1 0;align-items:center;gap:10px;padding:5px 12px 5px 6px;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,border-color .3s;display:flex;position:relative}.bh-team.is-turn{border-color:var(--c);box-shadow:0 0 0 3px color-mix(in srgb, var(--c) 22%, transparent), 0 12px 24px -12px color-mix(in srgb, var(--c) 85%, #000);transform:translateY(-1px)}.bh-team.is-turn:after{content:"";z-index:0;pointer-events:none;border-radius:inherit;background:linear-gradient(105deg, transparent 38%, color-mix(in srgb, var(--c) 16%, #ffffffe6) 50%, transparent 62%);background-size:260% 100%;animation:3s ease-in-out infinite bh-shine;position:absolute;inset:0}@keyframes bh-shine{0%{background-position:130% 0}55%,to{background-position:-40% 0}}.bh-team__badge{background:radial-gradient(circle at 35% 25%, #fff, color-mix(in srgb, var(--c) 18%, #fff));width:38px;height:38px;box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--c) 30%, transparent), 0 3px 8px -4px color-mix(in srgb, var(--c) 70%, #000);border-radius:10px;flex-shrink:0;place-items:center;display:grid}.bh-house{filter:drop-shadow(0 1px 1px #0000002e);width:30px;height:30px;display:block}.bh-team__body{z-index:1;flex:1;min-width:0;position:relative}.bh-team__badge{z-index:1;position:relative}.bh-team__top{align-items:center;gap:6px;display:flex}.bh-team__name{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-family:var(--font-game);color:#10233a;font-size:16px;font-weight:800;line-height:1.15;overflow:hidden}.bh-team__lead{filter:drop-shadow(0 1px 2px #b46e0080);font-size:14px;line-height:1}.bh-team__turn{z-index:1;letter-spacing:.08em;color:#4a2800;background:linear-gradient(#ffe680,#f6b21a);border-radius:999px;padding:1px 8px;font-size:9px;font-weight:900;animation:1.4s ease-in-out infinite bh-turn;position:absolute;top:-8px;right:10px;box-shadow:0 3px 8px -3px #d68c00cc,inset 0 1px #ffffffb3}@keyframes bh-turn{0%,to{transform:scale(1)}50%{transform:scale(1.07)}}.bh-team__stats{align-items:center;gap:6px;margin-top:3px;display:flex}.bh-stat{font-variant-numeric:tabular-nums;white-space:nowrap;border-radius:999px;align-items:center;gap:4px;padding:1px 8px 1px 6px;font-size:12px;font-weight:800;display:inline-flex}.bh-stat--floor{color:#334155;background:#0f172a0e}.bh-stat--hp{color:#0369a1;background:#0ea5e91f}.bh-ic{flex-shrink:0;width:13px;height:13px;display:inline-block}.bh-tools{flex-shrink:0;align-items:center;gap:8px;display:flex}.bh-clock{color:#fff;font-variant-numeric:tabular-nums;white-space:nowrap;background:linear-gradient(135deg,#14b8a6,#0284c7);border-radius:999px;align-items:baseline;gap:4px;padding:6px 13px;font-size:13px;font-weight:800;display:inline-flex;box-shadow:0 8px 18px -10px #0284c7e6,inset 0 1px #ffffff59}.bh-clock b{font-family:var(--font-game);font-size:17px;line-height:1}.bh-clock small{opacity:.8;font-size:13px}.builder-stage .bh-tool{background:#ffffffeb;border-color:#0f172a1a;border-radius:10px;box-shadow:0 6px 14px -10px #0f172a99}.bh-btn{color:#1e293b;white-space:nowrap;cursor:pointer;background:#fffffff0;border:1px solid #0f172a1f;border-radius:10px;height:36px;padding:0 14px;font-size:14px;font-weight:700;transition:transform .15s,box-shadow .15s,background .15s;box-shadow:0 6px 14px -10px #0f172a99}.bh-btn:hover{background:#fff;transform:translateY(-1px);box-shadow:0 10px 18px -10px #0f172a99}.bh-btn--on{color:#fff;background:linear-gradient(135deg,#14b8a6,#0891b2);border-color:#0000}.bh-btn--on:hover{background:linear-gradient(135deg,#2dd4bf,#0ea5e9)}.builder-panel{z-index:4;box-sizing:border-box;background:linear-gradient(#fffffff2,#fffaeeeb);border-radius:16px;width:min(920px,100% - 400px);margin:10px auto 6px;padding:9px 14px 12px;animation:.38s cubic-bezier(.34,1.56,.64,1) builder-pop;position:relative;box-shadow:0 18px 44px -22px #14325a99,0 0 0 1px #d6b25e4d,inset 0 1px #fff}@keyframes builder-pop{0%{opacity:0;transform:translateY(10px)scale(.97)}to{opacity:1;transform:none}}.builder-panel__who{color:#475569;justify-content:center;align-items:center;gap:8px;margin:0 0 8px;font-size:14px;font-weight:600;display:flex}.builder-panel__who b{font-family:var(--font-game);color:var(--c);font-size:18px;font-weight:800}.builder-panel__dot{background:var(--c);width:10px;height:10px;box-shadow:0 0 0 0 color-mix(in srgb, var(--c) 55%, transparent);border-radius:50%;animation:1.6s ease-out infinite builder-dot}@keyframes builder-dot{0%{box-shadow:0 0 0 0 color-mix(in srgb, var(--c) 55%, transparent)}to{box-shadow:0 0 0 10px color-mix(in srgb, var(--c) 0%, transparent)}}.builder-materials__row{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;width:100%;display:grid}.builder-mat{--mb:#cbd5e1;--mt:#f8fafc;--ms:#0f172a80;box-sizing:border-box;border:1.5px solid var(--mb);background:linear-gradient(180deg, #fff 0%, var(--mt) 100%);width:100%;min-width:0;box-shadow:0 8px 18px -13px var(--ms), inset 0 1px 0 #fff, inset 0 -2px 0 #00000009;text-align:left;cursor:pointer;border-radius:13px;align-items:center;gap:11px;padding:8px 11px 8px 8px;transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;display:flex;position:relative;overflow:hidden}.builder-mat:after{content:"";pointer-events:none;background:linear-gradient(105deg,#0000 40%,#fffc 50%,#0000 60%) 130% 0/260% 100%;transition:background-position .7s;position:absolute;inset:0}.builder-mat:hover:not(:disabled){box-shadow:0 16px 26px -14px var(--ms), 0 0 0 3px color-mix(in srgb, var(--mb) 26%, transparent), inset 0 1px 0 #fff;transform:translateY(-3px)}.builder-mat:hover:not(:disabled):after{background-position:-40% 0}.builder-mat:active:not(:disabled){transform:translateY(0)scale(.98)}.builder-mat:disabled{cursor:not-allowed;filter:grayscale();opacity:.45}.builder-mat--rom{--mb:#e4b646;--mt:#fff3cf;--ms:#be870abf}.builder-mat--go{--mb:#b98246;--mt:#f7e6d2;--ms:#7d4614bf}.builder-mat--gach{--mb:#a7a197;--mt:#efece6;--ms:#5a5046b3}.builder-mat__thumb{background:var(--block-img) 50% 55% / 170% auto no-repeat, #fff;border-radius:9px;flex-shrink:0;width:62px;height:42px;box-shadow:0 5px 10px -5px #00000073,inset 0 0 0 1.5px #ffffffb3}.builder-mat__content{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.builder-mat__name{font-family:var(--font-game);color:#1b2b3d;white-space:nowrap;align-items:center;gap:7px;font-size:18px;font-weight:800;line-height:1.1;display:flex}.builder-mat__stars{gap:1px;font-size:12px;line-height:1;display:inline-flex}.builder-mat__stars i{color:#dfe4ea;font-style:normal}.builder-mat__stars i.is-on{color:#f5ad0b;text-shadow:0 1px #b4640059}.builder-mat__sub{color:#64748b;white-space:nowrap;text-overflow:ellipsis;align-items:center;gap:4px;font-size:12.5px;font-weight:700;line-height:1.2;display:flex;overflow:hidden}.builder-mat__dot{opacity:.45;font-weight:400}.builder-mat__count{color:#0f766e;font-weight:800}.builder-mat__out{color:#e11d48;font-weight:800}.builder-mat__none{color:#94a3b8;font-weight:800}.builder-mat__dur{font-family:var(--font-sans);color:#0c4a6e;font-variant-numeric:tabular-nums;background:linear-gradient(#f0f9ff,#d6efff);border-radius:999px;flex-shrink:0;align-items:center;gap:3px;margin-left:auto;padding:2px 8px 2px 6px;font-size:13px;font-weight:900;display:inline-flex;box-shadow:inset 0 0 0 1px #0e74b447,0 3px 6px -4px #0369a199}.builder-mat__dur .bh-ic{color:#0284c7;width:13px;height:13px}.gq-card.builder-q{z-index:4;width:min(920px,100% - 400px);box-shadow:0 20px 44px -22px #14325a99, 0 0 34px color-mix(in srgb, var(--gq-c) 28%, transparent);position:relative}.builder-q__mat-badge{color:#3b2a14;background:linear-gradient(#fff,#f3eadb);border-radius:999px;align-items:center;gap:5px;padding:3px 10px;font-size:13.5px;font-weight:800;display:inline-flex;box-shadow:inset 0 0 0 1px #966e3247}.builder-q__mat-badge--rom{background:linear-gradient(#fffaf0,#ffe9ae)}.builder-q__mat-badge--go{background:linear-gradient(#fff8f0,#f0d7b8)}.builder-q__mat-badge--gach{background:linear-gradient(#fff,#e7e3dc)}.builder-q__steal{color:#92400e;background:linear-gradient(#fff8dc,#ffe9a3);border-radius:999px;justify-content:center;align-items:center;gap:6px;margin:9px 0 0;padding:6px 10px;font-size:13px;font-weight:900;display:flex;box-shadow:inset 0 0 0 1.5px #f8c64a}.builder-timer{flex-shrink:0;place-items:center;width:40px;height:40px;display:grid;position:relative}.builder-timer__svg{filter:drop-shadow(0 2px 3px #0284c74d);width:100%;height:100%;position:absolute;inset:0;transform:rotate(-90deg)}.builder-timer__num{font-family:var(--font-game);color:#0f766e;font-variant-numeric:tabular-nums;font-size:15px;font-weight:800;line-height:1;position:relative}.builder-timer.is-urgent .builder-timer__num{color:#ef4444;animation:.6s ease-in-out infinite alternate builder-timer-pulse}@keyframes builder-timer-pulse{0%{transform:scale(1)}to{transform:scale(1.2)}}.builder-legend{z-index:6;pointer-events:none;background:linear-gradient(#ffffffed,#fff8eae0);border-radius:14px;flex-direction:column;gap:3px;width:172px;padding:8px 8px 6px;display:flex;position:absolute;top:88px;left:12px;box-shadow:0 14px 30px -18px #14284699,0 0 0 1px #d6b25e4d,inset 0 1px #fff}.builder-legend__title{letter-spacing:.14em;text-transform:uppercase;color:#b45309;align-items:center;gap:6px;margin:0 2px 3px;font-size:10px;font-weight:900;display:flex}.builder-legend__title:after{content:"";background:linear-gradient(90deg,#d6a03c80,#0000);flex:1;height:1px}.builder-legend__row{border-radius:10px;align-items:center;gap:8px;padding:2px 4px;transition:background .25s,box-shadow .25s;display:flex}.builder-legend__row.is-now{background:#ef444424;box-shadow:inset 0 0 0 1.5px #ef444473}.builder-legend__img{object-fit:contain;background:radial-gradient(circle at 40% 35%,#fff,#fde7c7);border-radius:50%;flex-shrink:0;width:30px;height:30px;padding:1px;box-shadow:inset 0 0 0 1.5px #c88c3c59}.builder-legend__row.is-now .builder-legend__img{animation:.5s ease-in-out infinite alternate builder-legend-pulse}@keyframes builder-legend-pulse{to{transform:scale(1.16)}}.builder-legend__name{color:#14283c;white-space:nowrap;flex:1;font-size:12.5px;font-weight:800}.builder-legend__dmg{color:#fff;font-variant-numeric:tabular-nums;background:linear-gradient(#fb7185,#e11d48);border-radius:999px;padding:1px 7px;font-size:11.5px;font-weight:900}.builder-yard{--wall:clamp(112px, 13.5vw, 220px);z-index:2;grid-template-columns:repeat(var(--n,2), 1fr);flex:1;align-items:end;gap:clamp(8px,1.5vw,20px);min-height:0;padding:14px clamp(10px,2vw,30px) clamp(24px,6vh,72px);display:grid;position:relative}.builder-yard[data-teams="2"]{--n:2}.builder-yard[data-teams="3"]{--n:3}.builder-yard[data-teams="4"]{--n:4;--wall:clamp(104px, 12.6vw, 210px)}.builder-plot{flex-direction:column;justify-content:flex-end;align-items:center;min-width:0;height:100%;display:flex;position:relative}.builder-fit{transform:scale(var(--fit,1));transform-origin:50% 100%;flex-direction:column;align-items:center;transition:transform .8s cubic-bezier(.22,.8,.3,1);display:flex;position:relative}.builder-beam{z-index:0;width:calc(var(--wall) * 1.9);background:radial-gradient(ellipse 34% 100% at 50% 100%, color-mix(in srgb, var(--c) 16%, #ffffec80), #ffffec00 100%), radial-gradient(ellipse 50% 30% at 50% 100%, color-mix(in srgb, var(--c) 22%, #ffffec66), #ffffec00 100%);pointer-events:none;height:100%;animation:2.6s ease-in-out infinite alternate builder-beam;position:absolute;bottom:0;left:50%;transform:translate(-50%)}.builder-beam:after{content:"";left:50%;bottom:calc(var(--wall) * .02);width:calc(var(--wall) * 1.3 * var(--fit,1));height:calc(var(--wall) * .26 * var(--fit,1));border:3px solid color-mix(in srgb, var(--c) 70%, #fff);box-shadow:0 0 18px color-mix(in srgb, var(--c) 60%, transparent);opacity:0;border-radius:50%;animation:2s ease-out infinite builder-ring;position:absolute;transform:translate(-50%)scale(.9)}@keyframes builder-beam{0%{opacity:.55}to{opacity:1}}@keyframes builder-ring{0%{opacity:.9;transform:translate(-50%)scale(.85)}to{opacity:0;transform:translate(-50%)scale(1.35)}}.builder-house{will-change:transform;transform:translateZ(0);z-index:1;transform-origin:50% 100%;flex-direction:column;align-items:center;display:flex;position:relative}.builder-house.is-shaking{animation:.5s ease-in-out both builder-shake;animation-delay:var(--bd-hit,1.9s);animation-iteration-count:var(--bd-hits,1)}@keyframes builder-shake{0%,to{transform:translate(0)rotate(0)}20%{transform:translate(-6px)rotate(-1.8deg)}50%{transform:translate(6px)rotate(1.6deg)}80%{transform:translate(-3px)rotate(-.8deg)}}.builder-house.is-hurt{animation:.55s ease-in-out builder-wobble}@keyframes builder-wobble{0%,to{transform:rotate(0)}25%{transform:rotate(-2.2deg)}60%{transform:rotate(1.6deg)}}.builder-top{z-index:6;pointer-events:none;flex-direction:column;align-items:center;gap:2px;margin-bottom:-4px;display:flex;position:absolute;bottom:100%;left:50%;transform:translate(-50%)}.builder-turnmark{background:radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--c) 45%, #fff), var(--c) 70%);width:36px;height:36px;box-shadow:0 0 0 3px #fff, 0 8px 16px -6px color-mix(in srgb, var(--c) 80%, #000), 0 0 22px color-mix(in srgb, var(--c) 60%, transparent);border-radius:50%;place-items:center;animation:1s ease-in-out infinite builder-arrow;display:grid}.builder-turnmark svg{fill:none;stroke:#fff;stroke-width:3.4px;stroke-linecap:round;stroke-linejoin:round;width:22px;height:22px;margin-top:2px}@keyframes builder-arrow{0%,to{transform:translateY(-4px)}50%{transform:translateY(4px)}}.builder-crown{width:calc(var(--wall) * .3);filter:drop-shadow(0 4px 5px #a0640073)drop-shadow(0 0 10px #ffd75acc);transform-origin:50% 100%;height:auto;animation:.6s cubic-bezier(.34,1.7,.5,1) both builder-crown-in,2.4s ease-in-out .6s infinite builder-crown;display:block}@keyframes builder-crown-in{0%{opacity:0;transform:translateY(-30px)scale(.3)}to{opacity:1;transform:none}}@keyframes builder-crown{0%,to{transform:translateY(0)rotate(-3deg)}50%{transform:translateY(-5px)rotate(3deg)}}.builder-hit,.builder-gain{z-index:7;margin-top:calc(var(--wall) * .16);white-space:nowrap;font-family:var(--font-game);color:#fff;border:2px solid #fff;border-radius:999px;padding:3px 13px;font-size:clamp(14px,1.5vw,19px);font-weight:800;line-height:1.2;position:absolute;top:100%;left:50%}.builder-hit{animation:builder-hitpop .5s var(--bd-hit,0s) cubic-bezier(.34, 1.7, .5, 1) both;background:linear-gradient(#ff6464,#d9203d);box-shadow:0 10px 20px -8px #a01428bf}.builder-hit--fall{background:linear-gradient(sienna,#5f2b0e)}.builder-hit--now{animation:2.2s cubic-bezier(.34,1.7,.5,1) both builder-hurt}@keyframes builder-hurt{0%{opacity:0;transform:translate(-50%,30%)scale(.4)}14%{opacity:1;transform:translate(-50%,-12%)scale(1.14)}24%{transform:translate(-50%)scale(1)}80%{opacity:1;transform:translate(-50%,-6px)scale(1)}to{opacity:0;transform:translate(-50%,-16px)scale(.96)}}@keyframes builder-hitpop{0%{opacity:0;transform:translate(-50%,30%)scale(.4)}60%{opacity:1;transform:translate(-50%,-12%)scale(1.14)}to{opacity:1;transform:translate(-50%)scale(1)}}.builder-gain{background:linear-gradient(#34d399,#059669);align-items:center;gap:8px;animation:1.9s ease-out .45s both builder-gain;display:inline-flex;box-shadow:0 10px 22px -8px #057855cc,0 0 18px #34d3998c}.builder-gain span{color:#ecfeff;align-items:center;gap:3px;font-size:.85em;display:inline-flex}.builder-gain .bh-ic{width:1em;height:1em}@keyframes builder-gain{0%{opacity:0;transform:translate(-50%,24px)scale(.5)}14%{opacity:1;transform:translate(-50%,-4px)scale(1.12)}26%{transform:translate(-50%)scale(1)}74%{opacity:1;transform:translate(-50%,-18px)scale(1)}to{opacity:0;transform:translate(-50%,-38px)scale(.96)}}.builder-roof{width:calc(var(--wall) * 1.08);aspect-ratio:1168/571;height:auto;margin-bottom:calc(var(--wall) * -.03);z-index:3;display:block;position:relative}.builder-roof:before{content:"";z-index:1;background:var(--roof-img) center bottom / 100% 100% no-repeat;filter:drop-shadow(0 7px 6px #0000003d);position:absolute;inset:0}.builder-roof:after{content:"";z-index:2;pointer-events:none;-webkit-mask:var(--roof-img) center bottom / 100% 100% no-repeat;-webkit-mask:var(--roof-img) center bottom / 100% 100% no-repeat;mask:var(--roof-img) center bottom / 100% 100% no-repeat;background:linear-gradient(115deg,#0000 38%,#ffffff8c 48%,#0000 58%) 0 0/300% 100%;animation:7s ease-in-out infinite builder-gloss;position:absolute;inset:0}@keyframes builder-gloss{0%,70%{background-position:120% 0}to{background-position:-30% 0}}.builder-roof.is-hoist{animation:1s ease-in-out both builder-hoist}@keyframes builder-hoist{0%,22%{transform:translateY(0)}48%{transform:translateY(-12px)}66%{transform:translateY(0)}74%{transform:translateY(3px)}82%,to{transform:translateY(0)}}.builder-chimney{z-index:0;background:linear-gradient(90deg,#c7644a 0%,#e0805f 38%,#b24f37 70%,#8f3d2a 100%);border-radius:2px 2px 0 0;width:9%;height:52%;position:absolute;top:16%;right:22%}.builder-chimney:before{content:"";background:linear-gradient(#6b4a3a,#4b3226);border-radius:2px;height:16%;position:absolute;top:-2px;left:-18%;right:-18%}.builder-smoke{aspect-ratio:1;filter:blur(1.5px);opacity:0;background:radial-gradient(circle at 45% 45%,#fffc,#e8eef573 40%,#e8eef500 70%);border-radius:50%;width:130%;animation:4.2s ease-out infinite builder-smoke;position:absolute;bottom:100%;left:50%}.builder-smoke:nth-child(2){animation-delay:1.3s}.builder-smoke:nth-child(3){animation-delay:2.6s}@keyframes builder-smoke{0%{opacity:0;transform:translate(-50%,30%)scale(.4)}15%{opacity:.85}60%{opacity:.45}to{opacity:0;transform:translateY(-190%)scale(2.1)}}.builder-hook{z-index:4;width:calc(var(--wall) * .14);aspect-ratio:40/64;pointer-events:none;animation:1.25s cubic-bezier(.45,0,.3,1) both builder-hook;position:absolute;bottom:86%;left:50%;transform:translate(-50%,-70vh)}.builder-hook svg{filter:drop-shadow(0 3px 3px #0000004d);width:100%;height:100%;position:absolute;inset:0;overflow:visible}.builder-hook:before{content:"";background:linear-gradient(90deg,#334155,#64748b,#334155);width:3px;height:80vh;position:absolute;bottom:100%;left:50%;transform:translate(-50%)}@keyframes builder-hook{0%{transform:translate(-50%,-70vh)}24%{transform:translate(-50%)}62%{transform:translate(-50%)}to{transform:translate(-50%,-70vh)}}.builder-block{will-change:transform;transform:translateZ(0);--bh:.44;width:calc(var(--wall) * 1.02);height:calc(var(--wall) * var(--bh));margin-top:calc(var(--wall) * -.05);background:var(--block-img) center bottom / 100% 100% no-repeat;filter:drop-shadow(0 4px 3px #0000002b);transform-origin:50% 100%;display:block;position:relative}.builder-block.is-ground{--bh:.52;margin-bottom:calc(var(--wall) * -.03)}.builder-block.is-new{background-size:100% calc(var(--wall) * var(--bh));background-position:top;animation:.5s cubic-bezier(.3,.8,.4,1) .26s both builder-grow}@keyframes builder-grow{0%{height:0;margin-top:0}to{height:calc(var(--wall) * var(--bh));margin-top:calc(var(--wall) * -.05)}}.builder-block.is-new:after{content:"";pointer-events:none;-webkit-mask:var(--block-img) center top / 100% 100% no-repeat;-webkit-mask:var(--block-img) center top / 100% 100% no-repeat;mask:var(--block-img) center top / 100% 100% no-repeat;background:linear-gradient(110deg,#0000 35%,#fff6c8e6 48%,#fffffff2 50%,#0000 64%) 130% 0/280% 100%;animation:.9s ease-in-out .78s both builder-sheen;position:absolute;inset:0}@keyframes builder-sheen{0%{background-position:130% 0}to{background-position:-40% 0}}.builder-dust{pointer-events:none;z-index:3;height:0;position:absolute;bottom:0;left:0;right:0}.builder-dust>i{--side:calc(var(--d) - 3.5);bottom:-6px;bottom:calc(-8px + mod(var(--d) * 7, 5) * 2px);left:calc(50% + var(--side) * 9% - var(--wall) * .1);width:calc(var(--wall) * .18);width:calc(var(--wall) * (.14 + mod(var(--d) * 3, 4) * .035));aspect-ratio:1;opacity:0;animation:1s ease-out .7s both builder-dust;animation-delay:calc(.7s + mod(var(--d) * 5, 3) * 40ms);background:radial-gradient(circle at 42% 42%,#fffbf0eb,#e9dbc08c 45%,#e9dbc000 70%);border-radius:50%;position:absolute}@keyframes builder-dust{0%{opacity:0;transform:translate(0)scale(.35)}22%{opacity:1}to{opacity:0;transform:translate(calc(var(--side) * 14px), calc(-6px - mod(var(--d), 3) * 6px)) scale(1.7)}}.builder-spark{pointer-events:none;z-index:4;width:0;height:0;position:absolute;top:50%;left:50%}.builder-spark>i{--a:calc(var(--d) * 36deg + 8deg);clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);filter:drop-shadow(0 0 4px #ffc828f2);opacity:0;background:linear-gradient(135deg,#fffdf0,#ffd84a 50%,#ff9f00);width:24px;height:24px;animation:1.05s cubic-bezier(.2,.7,.3,1) .68s both builder-spark;position:absolute;top:-12px;left:-12px}.builder-spark>i:nth-child(2n){width:15px;height:15px;top:-7.5px;left:-7.5px}@keyframes builder-spark{0%{opacity:0;transform:rotate(var(--a)) translateX(0) scale(.3)}25%{opacity:1}to{opacity:0;transform:rotate(var(--a)) translateX(calc(var(--wall) * .85)) rotate(180deg) scale(.7)}}.builder-block.is-doomed{filter:none;animation:builder-collapse .36s calc(var(--bd-hit,1.9s) + .14s) cubic-bezier(.55, 0, .9, .5) both;background:0 0}.builder-block.is-doomed:before{content:"";background:var(--block-img) center bottom / 100% 100% no-repeat;filter:drop-shadow(0 4px 3px #0000002b);animation:builder-shatter .12s var(--bd-hit,1.9s) steps(1, end) both;position:absolute;inset:0}@keyframes builder-shatter{0%{opacity:1;filter:brightness(1.9)}to{opacity:0}}@keyframes builder-collapse{0%{height:calc(var(--wall) * var(--bh))}to{height:0;margin-top:0}}.builder-shards{pointer-events:none;z-index:6;height:0;position:absolute;bottom:0;left:0;right:0}.builder-shards>i{--sw:calc(var(--wall) * .255);--sh:calc(var(--wall) * var(--bh) * .5);left:calc(var(--cx) * var(--sw));bottom:calc((1 - var(--cy)) * var(--sh));width:var(--sw);height:var(--sh);opacity:0;animation:builder-shard-x 1s calc(var(--bd-hit,1.9s) + var(--lag)) cubic-bezier(.15, .6, .35, 1) both;position:absolute}.builder-shards>i:before{content:"";background:var(--block-img) no-repeat;background-size:calc(var(--wall) * 1.02) calc(var(--wall) * var(--bh));background-position:calc(var(--cx) * var(--sw) * -1) calc(var(--cy) * var(--sh) * -1);filter:drop-shadow(0 3px 2px #0000004d);animation:builder-shard-y 1s calc(var(--bd-hit,1.9s) + var(--lag)) linear both;position:absolute;inset:0}@keyframes builder-shard-x{0%{opacity:1;translate:0}82%{opacity:1}to{opacity:0;translate:calc(var(--vx) * var(--wall) * .62) 0}}@keyframes builder-shard-y{0%{animation-timing-function:cubic-bezier(.2,.7,.45,1);transform:translateY(0)rotate(0)}24%{transform:translateY(calc(var(--up) * var(--wall) * -1)) rotate(calc(var(--rot) * .3));animation-timing-function:cubic-bezier(.5,0,.85,.5)}to{transform:translateY(calc(var(--wall) * 1.7)) rotate(var(--rot))}}.builder-plume{pointer-events:none;z-index:7;width:0;height:0;position:absolute;bottom:20%;left:50%}.builder-plume>i{--side:calc(var(--d) - 3);left:calc(var(--wall) * -.2);top:calc(var(--wall) * -.2);width:calc(var(--wall) * .4);height:calc(var(--wall) * .4);opacity:0;animation:builder-plume 1.7s calc(var(--bd-hit,1.9s) + 80ms + mod(var(--d) * 3, 4) * 50ms) cubic-bezier(.15, .7, .3, 1) both;background:radial-gradient(circle at 40% 38%,#fffaeef2,#dcc8a8b8 42%,#c4ac8800 70%);border-radius:50%;position:absolute}.builder-block--gach .builder-plume>i{background:radial-gradient(circle at 40% 38%,#fcf4ecf2,#d0beb2b8 42%,#b4a09400 70%)}@keyframes builder-plume{0%{opacity:0;transform:translate(0)scale(.3)}12%{opacity:1}to{opacity:0;transform:translate(calc(var(--side) * var(--wall) * .26), calc(var(--wall) * (-.12 - mod(var(--d) * 5, 3) * .12))) scale(calc(1.6 + mod(var(--d) * 7, 3) * .35))}}.builder-roof.is-drop{transform-origin:50% 100%;animation:builder-roof-drop .7s calc(var(--bd-hit,1.9s) + .5s) cubic-bezier(.3, .7, .4, 1) both}@keyframes builder-roof-drop{0%{transform:none}14%{transform:translateY(3px)scale(1.06,.9)rotate(-2.5deg)}40%{transform:translateY(calc(var(--wall) * -.09)) scale(.97, 1.04) rotate(2deg)}66%{transform:translateY(2px)scale(1.02,.97)rotate(-1deg)}84%{transform:translateY(calc(var(--wall) * -.015)) rotate(.4deg)}to{transform:none}}.builder-rubble{pointer-events:none;z-index:5;position:absolute;inset:0}.builder-rubble>i{--x:calc((var(--d) - 4) * 1);left:calc(8% + var(--d) * 10.5%);width:calc(var(--wall) * .08);height:calc(var(--wall) * .06);opacity:0;animation:builder-rubble 1s var(--bd-hit,1.9s) cubic-bezier(.2, .55, .45, 1) both;background:#b98b58;border-radius:2px;position:absolute;top:30%;box-shadow:inset -2px -2px #0003}.builder-block--rom .builder-rubble>i{background:#f0c451}.builder-block--go .builder-rubble>i{background:#b0763c}.builder-block--gach .builder-rubble>i{background:#ddd6c9}.builder-rubble>i:nth-child(3n){width:calc(var(--wall) * .05);height:calc(var(--wall) * .05);filter:brightness(.8)}@keyframes builder-rubble{0%{opacity:0;transform:translate(0)rotate(0)}8%{opacity:1}40%{transform:translate(calc(var(--x) * 12px), calc(var(--wall) * -.35)) rotate(calc(var(--d) * 70deg))}to{opacity:0;transform:translate(calc(var(--x) * 22px), calc(var(--wall) * .9)) rotate(calc(var(--d) * 160deg))}}.builder-puff{z-index:5;width:calc(var(--wall) * .9);aspect-ratio:1.6;opacity:0;pointer-events:none;background:radial-gradient(#64748bcc,#94a3b873 45%,#94a3b800 70%);border-radius:50%;animation:.9s ease-out both builder-puff;position:absolute;bottom:25%;left:50%;transform:translate(-50%)scale(.4)}@keyframes builder-puff{0%{opacity:0;transform:translate(-50%)scale(.4)}25%{opacity:1}to{opacity:0;transform:translate(-50%,-30%)scale(1.5)}}.builder-base{width:calc(var(--wall) * 1.36);height:calc(var(--wall) * .19);margin-top:calc(var(--wall) * -.07);background:linear-gradient(#bfae8f,#95846a);border-radius:50%;display:block;position:relative}.builder-base:before{content:"";transform:translateY(calc(var(--wall) * -.045));box-shadow:inset 0 -3px 0 color-mix(in srgb, var(--c) 75%, #fff), inset 0 -6px 0 color-mix(in srgb, var(--c) 35%, transparent), inset 0 2px 1px #fff;background:radial-gradient(at 44% 36%,#fffdf7 0%,#f1e8d6 55%,#dccdb1 100%);border-radius:50%;position:absolute;inset:0}.builder-base:after{content:"";z-index:-1;background:radial-gradient(#183c106b,#183c1000 68%);border-radius:50%;height:150%;position:absolute;top:10%;left:-12%;right:-12%}.builder-flag{bottom:calc(var(--wall) * .04);left:calc(50% - var(--wall) * .94);width:calc(var(--wall) * .3);aspect-ratio:60/120;pointer-events:none;position:absolute}.builder-flag svg{filter:drop-shadow(0 3px 3px #00000038);width:100%;height:100%;display:block;overflow:visible}.builder-flag__cloth{animation:2.2s ease-in-out infinite builder-wave}.builder-flag__num{font-family:var(--font-game);fill:#fff;paint-order:stroke;stroke:#0000002e;stroke-width:2px;font-size:20px;font-weight:800}@keyframes builder-wave{0%,to{d:path("M8 12 C20 8 30 18 44 13 C50 11 55 12 58 13 L58 44 C54 43 50 42 44 44 C30 49 20 39 8 43 Z")}50%{d:path("M8 12 C20 17 32 8 44 14 C50 17 55 15 58 12 L58 43 C55 46 50 47 44 45 C32 39 20 48 8 43 Z")}}.builder-yard[data-fx=smash],.builder-yard[data-fx=cannon],.builder-yard[data-fx=bomb]{animation:.5s ease-in-out 2 builder-quake;animation-delay:var(--bd-hit,1.9s)}.builder-yard[data-fx=claw]{animation:.1s ease-in-out 7 builder-jitter;animation-delay:var(--bd-hit,1.9s)}@keyframes builder-quake{0%,to{transform:translate(0)}20%{transform:translate(-9px,5px)}45%{transform:translate(8px,-4px)}70%{transform:translate(-6px,3px)}85%{transform:translate(4px,-2px)}}@keyframes builder-jitter{0%,to{transform:translate(0)}50%{transform:translate(-4px)}}.builder-attack{z-index:1;pointer-events:none;position:absolute;inset:0;overflow:hidden}.builder-attack-fx{z-index:30;pointer-events:none;position:absolute;inset:0;overflow:hidden}.builder-attack__stage{position:absolute;inset:0}.builder-attack__gl{width:100%;height:100%;display:block;position:absolute;inset:0}.builder-attack__veil{animation:bd-veil var(--bd-dur,4.2s) ease both;background:radial-gradient(75% 70% at 50% 58%,#0000 45%,#6e101e57 100%),linear-gradient(#2618484d,#26184800 46%);position:absolute;inset:0}@keyframes bd-veil{0%{opacity:0}14%{opacity:1}88%{opacity:1}to{opacity:0}}.builder-attack__beast{aspect-ratio:1;will-change:transform, opacity;width:clamp(180px,33vw,440px);animation:bd-approach var(--bd-dur,4.2s) cubic-bezier(.22, .7, .3, 1) both;position:absolute;top:50%;left:50%}@keyframes bd-approach{0%{opacity:0;transform:translate(-50%,calc(-50% - 17vh))scale(.2)}12%{opacity:1}45%{opacity:1;transform:translate(-50%,calc(-50% - 1vh))scale(1)}92%{opacity:1;transform:translate(-50%,calc(-50% - 1vh))scale(1)}to{opacity:0;transform:translate(-50%,calc(-50% - 1vh))scale(1)}}.builder-attack--spin .builder-attack__beast{animation-name:bd-approach-spin}@keyframes bd-approach-spin{0%{opacity:0;transform:translate(-50%,calc(-50% - 17vh))scale(.2)rotate(-40deg)}12%{opacity:1}45%{opacity:1;transform:translate(-50%,calc(-50% - 1vh))scale(1)rotate(12deg)}92%{opacity:1;transform:translate(-50%,calc(-50% - 1vh))scale(1)rotate(16deg)}to{opacity:0;transform:translate(-50%,calc(-50% - 1vh))scale(1)rotate(16deg)}}.builder-attack__img{object-fit:contain;filter:drop-shadow(0 18px 22px #00000073);transform-origin:50% 85%;width:100%;height:100%;animation:bd-lunge .5s var(--bd-hit,1.9s) cubic-bezier(.3, 1.6, .5, 1) both, bd-breathe 1.1s calc(var(--bd-hit,1.9s) + .5s) ease-in-out infinite alternate;display:block;position:relative}@keyframes bd-lunge{0%{transform:scale(1)}40%{transform:scale(1.16)translateY(4%)}to{transform:scale(1)}}@keyframes bd-breathe{0%{transform:scale(1)}to{transform:scale(1.035,.975)}}.builder-attack__shadow{background:radial-gradient(#19140a80,#19140a00 70%);border-radius:50%;height:12%;position:absolute;bottom:4%;left:14%;right:14%}.builder-attack__dust{width:0;height:0;position:absolute;bottom:8%;left:50%}.builder-attack__dust>i{left:calc((var(--d) - 3) * 11%);aspect-ratio:1;width:26%;min-width:50px;margin-left:calc((var(--d) - 3) * 30px - 25px);opacity:0;animation:.8s ease-out 4 bd-dust;animation-delay:calc(var(--d) * 90ms);background:radial-gradient(circle at 40% 40%,#fff4dee6,#d6be9699 50%,#d6be9600 72%);border-radius:50%;position:absolute;bottom:0}@keyframes bd-dust{0%{opacity:0;transform:translateY(0)scale(.4)}25%{opacity:.9}to{opacity:0;transform:translateY(-40px)scale(1.4)}}.builder-attack__claws{position:absolute;inset:0}.builder-attack__claw{width:min(70vw,820px);height:min(34vw,380px);position:absolute;top:54%;left:50%;transform:translate(-50%,-50%)rotate(-24deg)}.builder-attack__claw:nth-child(2n){transform:translate(-50%,-50%)rotate(24deg)scaleX(-1)}.builder-attack__claw>i{transform-origin:0;height:clamp(7px,1.1vw,14px);animation:.45s cubic-bezier(.2,.8,.3,1) both bd-slash;animation-delay:calc(var(--bd-hit,1.9s) + var(--h) * .38s);background:linear-gradient(90deg,#fff0,#fff 26%,#ffe4e6 55%,#ff5a6e00);border-radius:999px;position:absolute;left:0;right:0;transform:scaleX(0);box-shadow:0 0 18px #ff4664d9,0 0 4px #fff}.builder-attack__claw>i:first-child{top:26%}.builder-attack__claw>i:nth-child(2){animation-delay:calc(var(--bd-hit,1.9s) + var(--h) * .38s + 40ms);top:46%}.builder-attack__claw>i:nth-child(3){animation-delay:calc(var(--bd-hit,1.9s) + var(--h) * .38s + 80ms);top:66%}@keyframes bd-slash{0%{opacity:1;transform:scaleX(0)}45%{opacity:1;transform:scaleX(1)}to{opacity:0;transform:scaleX(1)translate(6%)}}.builder-attack__flash{opacity:0;animation:bd-flash .55s var(--bd-hit,1.9s) ease-out both;background:radial-gradient(at 50% 72%,#ffffffeb,#ffeec866 38%,#ffeec800 70%);position:absolute;inset:0}@keyframes bd-flash{0%{opacity:0}14%{opacity:1}to{opacity:0}}.builder-attack__ring{opacity:0;width:26vmin;height:7vmin;animation:bd-ring .95s var(--bd-hit,1.9s) cubic-bezier(.2, .7, .3, 1) both;border:5px solid #fffaebf2;border-radius:50%;position:absolute;bottom:11%;left:50%;box-shadow:0 0 22px #ffd68ce6,inset 0 0 14px #ffd68cb3}.builder-attack__ring--2{animation-delay:calc(var(--bd-hit,1.9s) + .16s);border-width:3px}@keyframes bd-ring{0%{opacity:1;transform:translate(-50%,50%)scale(.2)}to{opacity:0;transform:translate(-50%,50%)scale(5)}}.builder-attack__rocks{width:0;height:0;position:absolute;bottom:12%;left:50%}.builder-attack__rocks>i{--a:calc(-172deg + var(--d) * 15deg);opacity:0;width:clamp(10px,1.2vw,18px);height:clamp(8px,.95vw,14px);animation:bd-rock 1.1s var(--bd-hit,1.9s) cubic-bezier(.15, .6, .4, 1) both;background:linear-gradient(135deg,#c9a27a,#7f5539);border-radius:3px;position:absolute;top:-6px;left:-8px;box-shadow:inset -2px -2px #0003}.builder-attack__rocks>i:nth-child(3n){background:linear-gradient(135deg,#b7e07a,#5c9a32);border-radius:50% 50% 4px}@keyframes bd-rock{0%{opacity:0;transform:translate(0)scale(.5)}8%{opacity:1}45%{transform:translate(calc(cos(var(--a)) * 26vmin), calc(sin(var(--a)) * 24vmin)) rotate(260deg) scale(1)}to{opacity:0;transform:translate(calc(cos(var(--a)) * 40vmin), 8vmin) rotate(540deg) scale(.9)}}.builder-start{z-index:40;background:radial-gradient(at 50% 42%,#ffffff1a,#0c244280);place-items:center;display:grid;position:absolute;inset:0}.builder-start__card{text-align:center;background:linear-gradient(#fff 0%,#fffaf0 100%);border-radius:18px;width:min(540px,100% - 32px);max-height:calc(100% - 24px);padding:0 28px 24px;animation:.45s cubic-bezier(.34,1.56,.64,1) builder-pop;overflow:auto;box-shadow:0 40px 90px -30px #0a1e3cb3,0 0 0 1px #ffffffe6,0 0 0 6px #ffd67847}.builder-start__hero{background:radial-gradient(40% 60% at 16% 22%,#ffffffe6,#fff0 70%),radial-gradient(30% 40% at 62% 18%,#ffffffbf,#fff0 70%),linear-gradient(#4faaf2 0%,#9fd6fb 56%,#e2f5ff 70%,#9bdc63 71%,#6ec345 100%);height:136px;margin:0 -28px 14px;position:relative;overflow:hidden}.builder-start__sun{background:radial-gradient(circle at 44% 40%,#fffef6 0 40%,#ffe98a 70%,#ffcd4a);border-radius:50%;width:38px;height:38px;animation:4s ease-in-out infinite bs-breathe-plain;position:absolute;top:16px;right:12%;box-shadow:0 0 20px 8px #ffe896cc,0 0 60px 26px #ffe89659}@keyframes bs-breathe-plain{0%,to{transform:scale(1)}50%{transform:scale(1.1)}}.builder-start__town{justify-content:center;align-items:flex-end;gap:22px;display:flex;position:absolute;bottom:14px;left:0;right:0}.builder-start__mini{filter:drop-shadow(0 5px 4px #143c0a4d);transform-origin:50% 100%;animation:2.6s ease-in-out infinite builder-mini;animation-delay:calc(var(--i) * -.55s);flex-direction:column;align-items:center;display:flex}@keyframes builder-mini{0%,to{transform:translateY(0)scaleY(1)}50%{transform:translateY(-4px)scaleY(1.02)}}.builder-start__miniroof{aspect-ratio:1168/571;z-index:1;background:bottom/100% 100% no-repeat;width:64px;margin-bottom:-2px;display:block;position:relative}.builder-start__miniblock{background:bottom/100% 100% no-repeat;width:60px;height:27px;margin-top:-3px;display:block}.builder-start__eyebrow{letter-spacing:.22em;text-transform:uppercase;color:#c2710c;margin:0;font-size:11px;font-weight:900}.builder-start__title{font-family:var(--font-game);color:#12304d;margin:2px 0 14px;font-size:clamp(28px,3.4vw,34px);font-weight:800;line-height:1.1}.builder-start__count{align-items:center;gap:8px;margin-bottom:16px;display:inline-flex}.builder-start__count-label{color:#475569;margin-right:4px;font-size:15px;font-weight:700}.builder-start__countbtn{cursor:pointer;width:42px;height:42px;font-family:var(--font-game);color:#334155;background:linear-gradient(#fff,#f5f7fa);border:1.5px solid #d6dde6;border-radius:10px;font-size:19px;font-weight:800;transition:transform .15s,box-shadow .15s,border-color .15s;box-shadow:0 4px 10px -8px #0f172a99}.builder-start__countbtn:hover:not(:disabled){border-color:#94a3b8;transform:translateY(-2px)}.builder-start__countbtn.is-on{color:#fff;background:linear-gradient(135deg,#2dd4bf,#0891b2);border-color:#0000;box-shadow:0 8px 16px -8px #0891b2e6,inset 0 1px #fff6}.builder-start__countbtn:disabled{cursor:not-allowed;opacity:.35;filter:grayscale()}.builder-start__teams{grid-template-columns:repeat(2,1fr);gap:10px;width:100%;margin-bottom:18px;display:grid}.builder-start__teams[data-count="3"]>:last-child{grid-column:span 2;width:calc(50% - 5px);margin:0 auto}.builder-start__team{border:1.5px solid color-mix(in srgb, var(--c) 55%, #fff);background:linear-gradient(180deg, #fff, color-mix(in srgb, var(--c) 7%, #fff));box-shadow:0 6px 14px -12px color-mix(in srgb, var(--c) 80%, #000);border-radius:12px;align-items:center;gap:10px;padding:8px 10px 8px 12px;transition:transform .15s,box-shadow .15s;display:flex}.builder-start__team:focus-within{box-shadow:0 0 0 3px color-mix(in srgb, var(--c) 25%, transparent);transform:translateY(-1px)}.builder-start__team .bh-house{flex-shrink:0;width:28px;height:28px}.builder-start__swatch{cursor:pointer;border:none;border-radius:7px;flex-shrink:0;width:26px;height:26px;padding:0;box-shadow:inset 0 0 0 2.5px #fffc,0 2px 5px #00000038}.builder-start__name{text-align:left;width:100%;min-width:0;font-family:var(--font-game);color:var(--c);background:0 0;border:none;outline:none;flex:1;font-size:17px;font-weight:800}.builder-start__name::placeholder{color:color-mix(in srgb, var(--c) 50%, #94a3b8);font-weight:700}.builder-start__actions{justify-content:center;gap:10px;display:flex}.builder-start__warn{color:#9a3412;background:#fff7ed;border:1.5px solid #fdba74;border-radius:10px;margin:10px 0 0;padding:9px 12px;font-size:13px;font-weight:700;line-height:1.5}.builder-start__note{color:#64748b;text-align:center;margin:8px 0 0;font-size:12px;font-weight:700}.builder-btn{cursor:pointer;color:#16324a;background:#fff;border:1px solid #0f172a1f;border-radius:12px;padding:11px 24px;font-size:15px;font-weight:800;transition:transform .15s,box-shadow .15s,filter .15s;position:relative;overflow:hidden;box-shadow:0 8px 20px -14px #16324ab3}.builder-btn:hover{transform:translateY(-2px)}.builder-btn:active{transform:translateY(0)scale(.97)}.builder-btn--primary{color:#fff;background:linear-gradient(135deg,#2dd4bf 0%,#0d9488 45%,#0369a1 100%);border-color:#0000;box-shadow:0 14px 26px -12px #0369a1d9,inset 0 1px #fff6}.builder-btn--primary:after{content:"";pointer-events:none;background:linear-gradient(105deg,#0000 38%,#ffffff80 50%,#0000 62%) 0 0/260% 100%;animation:3.2s ease-in-out infinite bh-shine;position:absolute;inset:0}.builder-btn--primary:hover{filter:brightness(1.08);box-shadow:0 18px 30px -12px #0369a1e6,inset 0 1px #fff6}.builder-btn--ghost{color:#334155;background:linear-gradient(#fff,#f6f8fb)}.builder-btn--start{letter-spacing:.01em;padding:13px 38px;font-size:18px}.builder-finish{z-index:50;background:radial-gradient(at 50% 35%,#ffecbe33,#0a1a3094);place-items:center;display:grid;position:absolute;inset:0}.builder-finish__card{text-align:center;background:linear-gradient(#fffdf6,#fff 40%);border-radius:20px;width:min(640px,94%);max-height:calc(100% - 24px);padding:0 26px 22px;animation:.55s cubic-bezier(.34,1.56,.64,1) builder-pop;position:relative;overflow:auto;box-shadow:0 50px 100px -30px #000000a6,0 0 0 1px #ffffffe6,0 0 0 6px #f6c45366}.builder-finish__hero{background:radial-gradient(ellipse at 50% 26%, color-mix(in srgb, var(--c) 26%, #fff6d6), #fff9ea 72%);margin:0 -26px;padding:22px 20px 16px;position:relative;overflow:hidden}.builder-finish__rays{background:repeating-conic-gradient(#ffcd5061 0deg 7deg,#ffcd5000 7deg 18deg);width:560px;height:560px;animation:22s linear infinite bs-spin;position:absolute;top:60px;left:50%;-webkit-mask:radial-gradient(circle,#000 12%,#0000 60%);mask:radial-gradient(circle,#000 12%,#0000 60%)}.builder-finish__trophy{filter:drop-shadow(0 12px 14px #b46e0073);font-size:80px;line-height:1;animation:.5s ease-out both builder-trophy-in;position:relative}@keyframes builder-trophy-in{0%{opacity:0}to{opacity:1}}.builder-finish__eyebrow{letter-spacing:.22em;text-transform:uppercase;color:#b45309;margin:8px 0 0;font-size:12px;font-weight:900;position:relative}.builder-finish__winner{font-family:var(--font-game);color:var(--c);text-shadow:0 2px 0 #fff, 0 8px 20px color-mix(in srgb, var(--c) 45%, transparent);margin:2px 0 0;font-size:clamp(36px,5vw,50px);font-weight:800;line-height:1.08;position:relative}.builder-finish__title{font-family:var(--font-game);color:#12304d;margin:22px 0 6px;font-size:38px;font-weight:800}.builder-finish__rank{flex-direction:column;gap:8px;margin:16px 0 18px;padding:0;list-style:none;display:flex}.builder-finish__row{border:1.5px solid color-mix(in srgb, var(--c) 38%, #fff);background:linear-gradient(90deg, color-mix(in srgb, var(--c) 8%, #fff), #fff 70%);box-shadow:0 8px 18px -16px color-mix(in srgb, var(--c) 90%, #000);animation:builder-row .55s calc(.35s + var(--i) * .12s) cubic-bezier(.34, 1.4, .64, 1) both;border-radius:12px;grid-template-columns:40px 1fr auto;align-items:center;gap:12px;padding:9px 14px;display:grid}.builder-finish__row.is-first{border:2px solid var(--c);box-shadow:0 0 0 4px color-mix(in srgb, var(--c) 16%, transparent), 0 14px 26px -16px color-mix(in srgb, var(--c) 90%, #000)}@keyframes builder-row{0%{opacity:0;transform:translateY(14px)scale(.97)}to{opacity:1;transform:none}}.builder-finish__medal{text-align:center;font-size:27px;line-height:1}.builder-finish__team{text-align:left;flex-direction:column;gap:5px;min-width:0;display:flex}.builder-finish__team b{font-family:var(--font-game);color:var(--c);text-overflow:ellipsis;white-space:nowrap;font-size:20px;font-weight:800;line-height:1.1;overflow:hidden}.builder-finish__bar{background:#0f172a12;border-radius:999px;height:7px;display:block;overflow:hidden}.builder-finish__bar>i{height:100%;width:var(--w);border-radius:inherit;background:linear-gradient(90deg, color-mix(in srgb, var(--c) 60%, #fff), var(--c));animation:builder-bar .9s calc(.55s + var(--i) * .12s) cubic-bezier(.22, .8, .3, 1) both;display:block}@keyframes builder-bar{0%{width:0}}.builder-finish__stats{color:#1e293b;font-variant-numeric:tabular-nums;white-space:nowrap;grid-template-columns:76px 56px;place-items:center end;gap:8px;font-size:16px;font-weight:800;display:grid}.builder-finish__stats>span{align-items:center;gap:4px;display:inline-flex}.builder-finish__stats .bh-ic{width:16px;height:16px}.builder-finish__hp{color:#0369a1}.builder-finish__actions{justify-content:center;gap:12px;display:flex}.builder-confirm{z-index:55;background:#0c1e346b;place-items:center;display:grid;position:absolute;inset:0}.builder-confirm__card{background:linear-gradient(#fff,#fffaf0);border-radius:16px;width:min(440px,90%);padding:22px 22px 18px;animation:.35s cubic-bezier(.34,1.56,.64,1) builder-pop;box-shadow:0 30px 70px -26px #0009,0 0 0 1px #ffffffe6,0 0 0 5px #2dd4bf38}.builder-confirm__text{color:#12304d;margin:0 0 18px;font-size:17px;font-weight:800;line-height:1.5}.builder-confirm__actions{justify-content:flex-end;gap:10px;display:flex}.builder-confirm__actions .builder-btn{padding:10px 20px;font-size:14px}@media (max-width:1180px){.builder-panel,.gq-card.builder-q{width:calc(100% - 156px)}.builder-legend{width:62px;padding:6px 5px;left:8px}.builder-legend__title,.builder-legend__name{display:none}.builder-legend__row{flex-direction:column;gap:1px;padding:3px 2px}.builder-legend__dmg{padding:0 5px;font-size:10.5px}}@media (max-width:760px){.bh{gap:8px;padding:6px 8px}.bh-team{gap:6px;min-width:118px}.bh-team__badge,.bh-clock{display:none}.builder-panel,.gq-card.builder-q{width:calc(100% - 16px)}.builder-legend{display:none}.builder-materials__row{gap:6px}.builder-mat{flex-direction:column;align-items:flex-start;gap:5px}.builder-mat__thumb{width:100%;height:32px}}@media (max-width:960px) and (max-height:500px){.builder-materials__row{gap:8px}.builder-mat{gap:6px;padding:8px}.builder-mat__thumb{width:38px;height:36px}.builder-mat__name{flex-wrap:wrap;gap:4px;font-size:16px}.builder-mat__dur{margin-left:0}.builder-mat__sub{white-space:normal;flex-wrap:wrap;overflow:visible}.builder-legend__dmg{font-size:12px}}
      
/* Additional QuestionBanner & GameIntro & Stage layout styles */
.builder-stage {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  overflow: hidden !important;
  z-index: 99999 !important;
  user-select: none;
  -webkit-user-select: none;
  font-family: 'Be Vietnam Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.gq-card {
  border-radius: 1.25rem;
  border-width: 2.5px;
  border-style: solid;
  padding: 1.1rem 1.4rem;
  
  -webkit-
  border-color: var(--gq-c, #3b82f6);
  background: var(--gq-bg, #ffffff);
  box-shadow: 0 20px 44px -22px rgba(20, 50, 90, 0.6), 0 0 34px color-mix(in srgb, var(--gq-c, #3b82f6) 28%, transparent);
  color: var(--gq-ink, #1b2b3d);
}

.gq-pop {
  animation: 0.32s cubic-bezier(0.18, 0.9, 0.32, 1.4) gq-pop;
}
@keyframes gq-pop {
  0% { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}

.gq-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.gq-badge {
  background: var(--gq-c, #3b82f6);
  color: var(--gq-badge-ink, #ffffff);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.gq-q {
  color: var(--gq-ink, #1b2b3d);
  flex: 1;
  min-width: 0;
  font-size: var(--gq-font-size, 19px);
  font-weight: 800;
  line-height: 1.35;
  text-align: justify;
  text-justify: inter-word;
  word-break: break-word;
}

.gq-zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  margin-right: 8px;
}

.gq-zoom-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.gq-zoom-btn:hover {
  background: #ffffff;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.gq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (min-width: 1024px) {
  .gq-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.gq-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid var(--gq-opt-border, #eadfca);
  background: var(--gq-opt-bg, #ffffff);
  color: var(--gq-opt-ink, #1b2b3d);
  font-size: var(--gq-opt-font-size, 16px);
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  position: relative;
}
.gq-opt:not(:disabled):hover {
  border-color: var(--gq-opt-hover-border, var(--gq-c));
  background: var(--gq-opt-hover-bg, #f0f9ff);
  transform: translateY(-2px);
}
.gq-opt:disabled {
  cursor: default;
}
.gq-opt.is-correct {
  background: #22c55e38 !important;
  border-color: #22c55e !important;
  color: #15803d !important;
}
.gq-opt.is-wrong {
  background: #ef444433 !important;
  border-color: #ef4444 !important;
  color: #b91c1c !important;
}
.gq-opt.is-locked {
  opacity: 0.45 !important;
  cursor: not-allowed !important;
}
.gq-opt__k {
  color: var(--gq-c, #3b82f6);
  font-weight: 800;
  margin-right: 4px;
}
.gq-opt.is-correct .gq-opt__k, .gq-opt.is-wrong .gq-opt__k {
  color: inherit;
}

/* Game Intro Countdown animations */
.castle-intro-count {
  animation: 0.8s cubic-bezier(0.2, 0.9, 0.25, 1.3) both castle-count-anim;
}
@keyframes castle-count-anim {
  0% { opacity: 0; transform: scale(2.2) translateY(-15px); }
  35% { opacity: 1; transform: scale(0.92) translateY(4px); }
  55% { transform: scale(1.05) translateY(-2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.castle-intro-ready {
  animation: 0.6s cubic-bezier(0.2, 0.9, 0.25, 1.35) both castle-ready-anim;
}
@keyframes castle-ready-anim {
  0% { opacity: 0; letter-spacing: 0.22em; transform: scale(1.5) rotate(-2deg); }
  55% { opacity: 1; letter-spacing: 0.05em; transform: scale(0.94) rotate(0.8deg); }
  100% { opacity: 1; letter-spacing: 0.08em; transform: scale(1) rotate(0); }
}

/* Confetti canvas */
.builder-confetti-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 85;
}

    `;
    document.head.appendChild(styleEl);
  }

  // 2. CONSTANTS & SPECIFICATIONS
  const MATERIAL_HP = { rom: 12, go: 20, gach: 30 };
  const MATERIAL_SPEC = {
    rom: { label: "Rơm", difficulty: "nhan_biet", stars: 1, hp: 12, desc: "Nhận biết" },
    go: { label: "Gỗ", difficulty: "thong_hieu", stars: 2, hp: 20, desc: "Thông hiểu" },
    gach: { label: "Gạch", difficulty: "van_dung", stars: 3, hp: 30, desc: "Vận dụng" }
  };
  const MATERIALS = ["rom", "go", "gach"];

  const GROUND_MAT_IMAGES = {
    rom: "/games/builder/t1_rom_clean.webp",
    go: "/games/builder/t1_go_clean.webp",
    gach: "/games/builder/t2_gach_clean.webp"
  };
  const UPPER_MAT_IMAGES = {
    rom: "/games/builder/tn_rom_clean.webp",
    go: "/games/builder/tn_go_clean.webp",
    gach: "/games/builder/tn_gach_clean.webp"
  };
  const ROOF_IMAGES = [
    "/games/builder/mai_do_clean.webp",
    "/games/builder/mai_xanh_clean.webp",
    "/games/builder/mai_xanh_la_clean.webp",
    "/games/builder/mai_cam_clean.webp"
  ];
  const ROOF_COLOR_MAP = [
    { rgb: [239, 68, 68], asset: ROOF_IMAGES[0] },   // Red
    { rgb: [59, 130, 246], asset: ROOF_IMAGES[1] },  // Blue
    { rgb: [34, 197, 94], asset: ROOF_IMAGES[2] },   // Green
    { rgb: [245, 158, 11], asset: ROOF_IMAGES[3] }   // Orange
  ];

  function getRoofAssetForColor(colorHex, teamIdx) {
    if (!colorHex) return ROOF_IMAGES[teamIdx % ROOF_IMAGES.length];
    const s = colorHex.trim().replace(/^#/, '');
    if (!/^[0-9a-f]{6}$/i.test(s)) return ROOF_IMAGES[teamIdx % ROOF_IMAGES.length];
    const r = parseInt(s.slice(0, 2), 16);
    const g = parseInt(s.slice(2, 4), 16);
    const b = parseInt(s.slice(4, 6), 16);
    let bestDist = Infinity;
    let bestAsset = ROOF_IMAGES[0];
    for (const c of ROOF_COLOR_MAP) {
      const d = (r - c.rgb[0]) ** 2 + (g - c.rgb[1]) ** 2 + (b - c.rgb[2]) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestAsset = c.asset;
      }
    }
    return bestAsset;
  }

  const MONSTER_SPEC = {
    king_kong: { label: "King Kong", img: "/games/builder/king-kong.webp", damage: 27, hits: 1, effect: "smash", dur: 5600, hitDelay: 3450 },
    may_bay: { label: "Hổ", img: "/games/builder/ho_clean.webp", damage: 20, hits: 1, effect: "claw", dur: 5400, hitDelay: 3450 },
    xe_tang: { label: "Gấu", img: "/games/builder/gau_clean.webp", damage: 15, hits: 1, effect: "smash", dur: 5400, hitDelay: 3500 },
    soi: { label: "Sói", img: "/games/builder/soi.webp", damage: 10, hits: 3, effect: "claw", dur: 5400, hitDelay: 3400 }
  };
  const MONSTER_KINDS = ["king_kong", "may_bay", "xe_tang", "soi"];

  const COLOR_PALETTE = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#ea580c"];
  const DEFAULT_TEAM_NAMES = ["Đội 1", "Đội 2", "Đội 3", "Đội 4"];

  // 3. SOUND SYNTHESIZER
  class GameAudioSynthesizer {
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
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.04);
            break;
          }
          case 'whistle': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(2100, t);
            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.65);
            break;
          }
          case 'correct': {
            [660, 880].forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, t + idx * 0.09);
              gain.gain.setValueAtTime(0.25, t + idx * 0.09);
              gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.16);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + idx * 0.09);
              osc.stop(t + idx * 0.09 + 0.16);
            });
            break;
          }
          case 'wrong': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(110, t + 0.24);
            gain.gain.setValueAtTime(0.22, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.24);
            break;
          }
          case 'fanfare': {
            [523, 659, 784, 1046].forEach((freq, idx) => {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'square';
              osc.frequency.setValueAtTime(freq, t + idx * 0.12);
              gain.gain.setValueAtTime(0.22, t + idx * 0.12);
              gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.2);
              osc.connect(gain);
              gain.connect(this.ctx.destination);
              osc.start(t + idx * 0.12);
              osc.stop(t + idx * 0.12 + 0.2);
            });
            break;
          }
          case 'roar': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(98, t);
            osc.frequency.linearRampToValueAtTime(122, t + 0.35);
            osc.frequency.exponentialRampToValueAtTime(58, t + 1.45);
            gain.gain.setValueAtTime(0.32, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.45);
            break;
          }
          case 'swipe': {
            const bufSize = this.ctx.sampleRate * 0.3;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buf;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(500, t);
            filter.frequency.exponentialRampToValueAtTime(3200, t + 0.3);
            filter.Q.value = 1.3;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 0.3);
            break;
          }
          case 'smash':
          case 'land': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(96, t);
            osc.frequency.exponentialRampToValueAtTime(22, t + 0.95);
            gain.gain.setValueAtTime(0.55, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.95);
            break;
          }
          case 'crumble': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(190, t);
            osc.frequency.exponentialRampToValueAtTime(90, t + 0.22);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.22);
            break;
          }
          case 'skid': {
            const bufSize = this.ctx.sampleRate * 0.5;
            const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buf;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1900, t);
            filter.frequency.exponentialRampToValueAtTime(650, t + 0.5);
            filter.Q.value = 2.4;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.22, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            noise.start(t);
            noise.stop(t + 0.5);
            break;
          }
          case 'howl': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(330, t);
            osc.frequency.linearRampToValueAtTime(560, t + 0.66);
            osc.frequency.setValueAtTime(560, t + 1.18);
            osc.frequency.exponentialRampToValueAtTime(380, t + 1.9);
            gain.gain.setValueAtTime(0.26, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.9);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.9);
            break;
          }
          case 'growl': {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(86, t);
            osc.frequency.linearRampToValueAtTime(92, t + 0.2);
            osc.frequency.exponentialRampToValueAtTime(72, t + 0.95);
            gain.gain.setValueAtTime(0.24, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.95);
            break;
          }
        }
      } catch (e) {}
    }
  }

  // 4. CONFETTI GENERATOR
  function runConfetti(canvas, duration = 3200) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ["#F7B500", "#7C5CFC", "#10b3a3", "#ff7a59", "#22c55e", "#fcd34d"];
    const pieces = [];
    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * window.innerHeight * 0.4,
        w: 6 + 8 * Math.random(),
        h: 8 + 12 * Math.random(),
        vx: (Math.random() - 0.5) * 2.2,
        vy: 2 + 4 * Math.random(),
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        color: colors[i % colors.length]
      });
    }

    let start = 0;
    let reqId;
    function frame(now) {
      if (!start) start = now;
      const elapsed = now - start;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const alpha = Math.max(0, 1 - elapsed / duration);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (elapsed < duration) {
        reqId = requestAnimationFrame(frame);
      }
    }
    reqId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(reqId);
  }

  // 5. SVG WORLD BACKGROUND (q() from PomyAI)
  function renderSvgWorldBackground() {
    return `
      <div class="bs" aria-hidden="true" style="position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0;">
        <div class="bs-world" style="position:absolute; inset:0; width:100%; height:100%; background:url('/ey/games/xay-nha/bg_xay_nha.jpg') center bottom / cover no-repeat; transform:none;"></div>
      </div>
    `;
  }

  // 6. SVG ICONS
  function getHouseIconSvg(color) {
    return `
      <svg class="bh-house" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M6 19 L20 7 L34 19 Z" fill="${color}"/>
        <path d="M20 7 L34 19 L27 19 Z" fill="#000" opacity="0.14"/>
        <rect x="10" y="19" width="20" height="15" rx="1.5" fill="#fffaf0"/>
        <rect x="23" y="19" width="7" height="15" fill="#000" opacity="0.07"/>
        <rect x="17" y="25" width="6" height="9" rx="1" fill="${color}" opacity="0.85"/>
        <rect x="12.5" y="22" width="3.4" height="3.4" rx="0.6" fill="#8fd0ff"/>
        <rect x="24.2" y="22" width="3.4" height="3.4" rx="0.6" fill="#8fd0ff"/>
      </svg>
    `;
  }

  function getFloorIconSvg() {
    return `
      <svg class="bh-ic" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <rect x="4" y="15.5" width="16" height="4.5" rx="1.6"/>
        <rect x="6.5" y="9.5" width="11" height="4" rx="1.5" opacity="0.82"/>
        <rect x="9" y="4" width="6" height="3.5" rx="1.4" opacity="0.62"/>
      </svg>
    `;
  }

  function getShieldIconSvg() {
    return `
      <svg class="bh-ic" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M12 2.6c.3 0 .5.06.77.16l6 2.3c.44.17.73.6.73 1.07v4.9c0 4.6-3.03 8.55-7.05 10.13a1.2 1.2 0 0 1-.9 0C7.53 19.58 4.5 15.63 4.5 11.03v-4.9c0-.47.29-.9.73-1.07l6-2.3c.27-.1.47-.16.77-.16z"/>
      </svg>
    `;
  }

  function getCrownSvg() {
    return `
      <svg class="builder-crown" viewBox="0 0 64 44" aria-hidden="true">
        <defs>
          <linearGradient id="bdCrownG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff3b0"/>
            <stop offset="0.45" stop-color="#ffc93c"/>
            <stop offset="1" stop-color="#e08a00"/>
          </linearGradient>
        </defs>
        <path d="M6 16 L18 26 L32 6 L46 26 L58 16 L53 38 L11 38 Z" fill="url(#bdCrownG)" stroke="#b86a00" stroke-width="2" stroke-linejoin="round"/>
        <rect x="11" y="35" width="42" height="6" rx="2" fill="#e8a317" stroke="#b86a00" stroke-width="1.6"/>
        <circle cx="32" cy="27" r="4" fill="#ef4444" stroke="#fff" stroke-width="1.2"/>
        <circle cx="19" cy="31" r="2.6" fill="#38bdf8" stroke="#fff" stroke-width="1"/>
        <circle cx="45" cy="31" r="2.6" fill="#22c55e" stroke="#fff" stroke-width="1"/>
        <circle cx="6" cy="16" r="3.4" fill="#fff3b0" stroke="#b86a00" stroke-width="1.4"/>
        <circle cx="32" cy="6" r="3.8" fill="#fff3b0" stroke="#b86a00" stroke-width="1.4"/>
        <circle cx="58" cy="16" r="3.4" fill="#fff3b0" stroke="#b86a00" stroke-width="1.4"/>
      </svg>
    `;
  }

  function getCraneHookSvg() {
    return `
      <i class="builder-hook" aria-hidden="true">
        <svg viewBox="0 0 40 64">
          <rect x="11" y="0" width="18" height="14" rx="3" fill="#f5b301" stroke="#9a6b00" stroke-width="2"/>
          <rect x="11" y="5" width="18" height="3" fill="#1f2937" opacity="0.55"/>
          <path d="M20 14 L20 30" stroke="#475569" stroke-width="4"/>
          <path d="M20 30 C20 30 20 50 20 50 C20 58 30 58 31 50 L31 45" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
        </svg>
      </i>
    `;
  }

  const SHARDS_DATA = Array.from({ length: 8 }, (_, t) => {
    const s = t % 4;
    const a = Math.floor(t / 4);
    return {
      cx: s,
      cy: a,
      vx: +((s - 1.5) * (0.8 + ((37 * t) % 5) * 0.12)).toFixed(2),
      up: +((0 === a ? 0.42 : 0.2) + ((53 * t) % 7) * 0.04).toFixed(2),
      rot: ((97 * t) % 11 - 5) * 34 + (s < 2 ? -40 : 40),
      lag: ((29 * t) % 4) * 0.025
    };
  });

  // 7. DAMAGE CALCULATION (applyDamage)
  function applyDamage(blocks, dmg) {
    const s = blocks.map(b => ({ ...b, hp: b.hp ?? MATERIAL_HP[b.material] }));
    let rem = dmg;
    let destroyed = 0;
    while (rem > 0 && s.length > 0) {
      const top = s[s.length - 1];
      if (rem >= top.hp) {
        rem -= top.hp;
        s.pop();
        destroyed++;
      } else {
        top.hp -= rem;
        rem = 0;
      }
    }
    return { blocks: s, destroyed };
  }

  function getTeamDurability(blocks) {
    return (blocks || []).reduce((acc, b) => acc + (b.hp ?? MATERIAL_HP[b.material]), 0);
  }

  // 8. MAIN XAY NHA GAME CONTROLLER
  class XayNhaGame {
    constructor(container, options = {}) {
      this.container = container;
      this.options = options;
      this.onExit = options.onExit || (() => {});
      this.sound = new GameAudioSynthesizer();

      // Parse & normalize questions
      this.rawQuestions = this.options.questions || [];
      this.questionsByMaterial = { rom: [], go: [], gach: [] };
      this.categorizeQuestions();

      // Teams configuration
      const initTeamCount = Math.min(4, Math.max(2, this.options.teamCount || (this.options.teams ? this.options.teams.length : 2)));
      this.teams = Array.from({ length: initTeamCount }, (_, i) => {
        let name = DEFAULT_TEAM_NAMES[i];
        if (this.options.teams && this.options.teams[i]?.name) {
          name = this.options.teams[i].name;
        } else if (i === 0 && this.options.teamAName && this.options.teamAName !== 'Đội A' && this.options.teamAName !== 'Đội 1') {
          name = this.options.teamAName;
        } else if (i === 1 && this.options.teamBName && this.options.teamBName !== 'Đội B' && this.options.teamBName !== 'Đội 2') {
          name = this.options.teamBName;
        }
        return {
          name,
          color: (this.options.teams && this.options.teams[i]?.color) || COLOR_PALETTE[i]
        };
      });

      // Game state machine
      this.state = {
        phase: 'setup', // setup, intro, answering, feedback, placing, disaster, finished
        turnTeam: 0,
        currentTeam: 0,
        turnsDone: 0,
        houses: Array.from({ length: this.teams.length }, () => []),
        bet: null,
        currentQuestion: null,
        usedQuestions: [],
        lockedOptions: [],
        attemptedTeams: [],
        isStealTurn: false,
        feedback: null,
        schedule: [],
        lastEvent: null,
        isPaused: false,
        timerSec: this.options.secondsPerQuestion || 30,
        timerInterval: null,
        timerRemaining: this.options.secondsPerQuestion || 30,
        fontZoom: 1, // 0 to 4
        prevHousesBeforeDisaster: null,
        gainBadge: null
      };

      this.zoomScales = [16, 19, 23, 27, 31];
      this.confettiCleanup = null;
      this.resizeObs = null;

      this.init();
    }

    categorizeQuestions() {
      this.questionsByMaterial = { rom: [], go: [], gach: [] };
      if (!this.rawQuestions || this.rawQuestions.length === 0) {
        this.rawQuestions = this.getDefaultQuestions();
      }

      this.rawQuestions.forEach((q, idx) => {
        const lvl = (q.level || q.difficulty || '').toLowerCase();
        const id = q.id || 'q_' + idx;
        const normalizedQ = {
          id,
          text: q.text || q.stem || 'Câu hỏi ' + (idx + 1),
          options: q.options || ['A', 'B', 'C', 'D'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : (q.correctAnswer ? 'ABCD'.indexOf(q.correctAnswer) : 0),
          difficulty: lvl
        };

        if (lvl === 'nhan_biet' || lvl === 'rom' || lvl === 'de' || lvl === 'easy') {
          this.questionsByMaterial.rom.push(normalizedQ);
        } else if (lvl === 'thong_hieu' || lvl === 'go' || lvl === 'trung_binh' || lvl === 'medium') {
          this.questionsByMaterial.go.push(normalizedQ);
        } else if (lvl === 'van_dung' || lvl === 'gach' || lvl === 'kho' || lvl === 'hard') {
          this.questionsByMaterial.gach.push(normalizedQ);
        } else {
          if (idx % 3 === 0) this.questionsByMaterial.rom.push(normalizedQ);
          else if (idx % 3 === 1) this.questionsByMaterial.go.push(normalizedQ);
          else this.questionsByMaterial.gach.push(normalizedQ);
        }
      });

      if (this.questionsByMaterial.rom.length === 0) this.questionsByMaterial.rom = this.getDefaultQuestions().filter(q => q.level === 'nhan_biet');
      if (this.questionsByMaterial.go.length === 0) this.questionsByMaterial.go = this.getDefaultQuestions().filter(q => q.level === 'thong_hieu');
      if (this.questionsByMaterial.gach.length === 0) this.questionsByMaterial.gach = this.getDefaultQuestions().filter(q => q.level === 'van_dung');
    }

    getDefaultQuestions() {
      return [
        { id: 'd1', text: '8 + 7 = ?', options: ['15', '13', '16', '14'], correctIndex: 0, level: 'nhan_biet' },
        { id: 'd2', text: 'Số liền sau của số 99 là số nào?', options: ['98', '100', '101', '90'], correctIndex: 1, level: 'nhan_biet' },
        { id: 'd3', text: 'Hình tam giác có bao nhiêu cạnh?', options: ['2', '3', '4', '5'], correctIndex: 1, level: 'nhan_biet' },
        { id: 'd4', text: '56 : 8 = ?', options: ['6', '9', '8', '7'], correctIndex: 3, level: 'nhan_biet' },
        { id: 'd5', text: '1 mét bằng bao nhiêu xăng-ti-mét (cm)?', options: ['10cm', '100cm', '1000cm', '50cm'], correctIndex: 1, level: 'nhan_biet' },
        { id: 'd6', text: 'Số chẵn bé nhất có 2 chữ số là:', options: ['10', '12', '0', '2'], correctIndex: 0, level: 'nhan_biet' },

        { id: 'd7', text: 'Tính giá trị của biểu thức: 3 x 12 - 20', options: ['16', '26', '36', '24'], correctIndex: 0, level: 'thong_hieu' },
        { id: 'd8', text: 'Một tuần có 7 ngày. Vậy 4 tuần và 3 ngày có tất cả bao nhiêu ngày?', options: ['28 ngày', '30 ngày', '31 ngày', '34 ngày'], correctIndex: 2, level: 'thong_hieu' },
        { id: 'd9', text: 'Một cửa hàng có 45 quyển vở, đã bán 18 quyển. Cửa hàng còn lại bao nhiêu quyển?', options: ['27 quyển', '37 quyển', '25 quyển', '29 quyển'], correctIndex: 0, level: 'thong_hieu' },
        { id: 'd10', text: 'Mỗi túi có 5 quả cam. Hỏi 8 túi như thế có bao nhiêu quả cam?', options: ['35 quả', '40 quả', '45 quả', '50 quả'], correctIndex: 1, level: 'thong_hieu' },
        { id: 'd11', text: 'Tìm x biết: x - 18 = 42', options: ['24', '50', '60', '70'], correctIndex: 2, level: 'thong_hieu' },
        { id: 'd12', text: 'Lớp 3A có 35 học sinh, trong đó có 18 bạn nữ. Số bạn nam là:', options: ['15', '16', '17', '18'], correctIndex: 2, level: 'thong_hieu' },

        { id: 'd13', text: 'Lan có 24 con tem, Bình có nhiều hơn Lan 9 con tem. Cả hai bạn có bao nhiêu con tem?', options: ['48 con', '57 con', '33 con', '39 con'], correctIndex: 1, level: 'van_dung' },
        { id: 'd14', text: 'Tích của 6 và 9 hơn tổng của 6 và 9 bao nhiêu đơn vị?', options: ['39', '29', '45', '49'], correctIndex: 0, level: 'van_dung' },
        { id: 'd15', text: 'Hình chữ nhật có chiều dài 12cm, chiều rộng 8cm. Chu vi là:', options: ['20cm', '40cm', '96cm', '48cm'], correctIndex: 1, level: 'van_dung' },
        { id: 'd16', text: 'Có 45 bông hoa cắm đều vào 5 lọ. Hỏi 3 lọ như thế có bao nhiêu bông hoa?', options: ['25 bông', '27 bông', '30 bông', '35 bông'], correctIndex: 1, level: 'van_dung' },
        { id: 'd17', text: 'Thương của số lớn nhất có 2 chữ số với 9 là:', options: ['9', '10', '11', '12'], correctIndex: 2, level: 'van_dung' },
        { id: 'd18', text: 'Một hình vuông có chu vi bằng chu vi hình chữ nhật dài 10cm, rộng 6cm. Cạnh hình vuông là:', options: ['8cm', '16cm', '4cm', '32cm'], correctIndex: 0, level: 'van_dung' }
      ];
    }

    init() {
      injectStyles();
      this.stage = document.createElement('div');
      this.stage.className = 'builder-stage';
      this.stage.dataset.reduced = '0';
      this.container.appendChild(this.stage);

      this.render();
      this.setupAutoFitObserver();
    }

    setupAutoFitObserver() {
      const updateFit = () => {
        if (!this.stage) return;
        const yard = this.stage.querySelector('.builder-yard');
        if (!yard) return;
        const headerBottom = this.stage.querySelector('header.bh')?.getBoundingClientRect().bottom || 75;
        const panelOrQ = this.stage.querySelector('.builder-panel, .builder-q');
        const overlayBottom = panelOrQ ? panelOrQ.getBoundingClientRect().bottom : (headerBottom + 160);
        const yardRect = yard.getBoundingClientRect();
        const availableHeight = yardRect.bottom - overlayBottom - 40;

        let maxHouseHeight = 0;
        yard.querySelectorAll('.builder-fit').forEach(fitEl => {
          maxHouseHeight = Math.max(maxHouseHeight, fitEl.offsetHeight);
        });

        const fit = maxHouseHeight > 0 ? Math.min(1, Math.max(0.38, availableHeight / maxHouseHeight)) : 1;
        yard.style.setProperty('--fit', fit.toFixed(3));
      };

      this.resizeObs = new ResizeObserver(updateFit);
      this.resizeObs.observe(this.stage);
      window.addEventListener('resize', updateFit);
    }

    scheduleDisasters(totalTurns, teamCount) {
      const rounds = Math.floor(totalTurns / teamCount);
      const schedule = [];
      const possibleTurns = [];
      for (let r = 1; r < rounds; r++) {
        possibleTurns.push(r * teamCount);
      }
      if (possibleTurns.length === 0) return [];
      
      const count = Math.max(1, Math.min(possibleTurns.length, Math.round(rounds * 0.6)));
      const shuffled = [...possibleTurns].sort(() => Math.random() - 0.5);
      const selectedTurns = shuffled.slice(0, count).sort((a, b) => a - b);
      
      return selectedTurns.map(turn => ({
        turn,
        kind: MONSTER_KINDS[Math.floor(Math.random() * MONSTER_KINDS.length)]
      }));
    }

    startIntroCountdown() {
      this.state.phase = 'intro';
      this.render();

      let count = 3;
      const countEl = this.stage.querySelector('.castle-intro-count');
      const readyEl = this.stage.querySelector('.castle-intro-ready');
      const container = this.stage.querySelector('#builder-intro-container');

      this.sound.play('tick');

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          this.sound.play('tick');
          if (container) {
            container.innerHTML = `
              <div class="castle-intro-count text-[clamp(130px,28vh,280px)] font-black leading-none ${count === 3 ? 'text-amber-500' : count === 2 ? 'text-amber-400' : 'text-cyan-400'}"
                   style="font-family:'Avenir Next','Arial Rounded MT Bold',ui-rounded,system-ui,sans-serif; -webkit-text-stroke:6px #0f766e; paint-order:stroke fill; text-shadow:0 12px 0 #115e59, 0 0 40px rgba(20,184,166,0.8);">
                ${count}
              </div>
            `;
          }
        } else if (count === 0) {
          this.sound.play('whistle');
          if (container) {
            container.innerHTML = `
              <div class="castle-intro-ready text-[clamp(48px,12vh,120px)] font-black tracking-wider text-teal-300"
                   style="font-family:var(--font-game,'Arial Rounded MT Bold',system-ui,sans-serif); -webkit-text-stroke:5px #0f766e; paint-order:stroke fill; text-shadow:0 10px 0 #115e59, 0 0 50px rgba(20,184,166,0.95), 0 0 90px rgba(45,212,191,0.7);">
                🏗️ SẴN SÀNG! 🏗️
              </div>
            `;
          }
        } else {
          clearInterval(interval);
          this.state.phase = 'answering';
          this.render();
        }
      }, 850);
    }

    // Material Selection
    selectMaterial(material) {
      if (this.state.phase !== 'answering' || this.state.bet) return;
      const unasked = this.questionsByMaterial[material].filter(q => !this.state.usedQuestions.includes(q.id));
      const q = unasked[0] || this.questionsByMaterial[material][0];
      if (!q) return;

      this.state.bet = material;
      this.state.currentQuestion = q;
      this.state.usedQuestions.push(q.id);
      this.state.lockedOptions = [];
      this.state.attemptedTeams = [];
      this.state.isStealTurn = false;
      this.state.feedback = null;
      this.state.timerRemaining = this.state.timerSec;

      this.sound.play('tick');
      this.render();
      this.startQuestionTimer();
    }

    startQuestionTimer() {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = setInterval(() => {
        if (this.state.isPaused) return;
        this.state.timerRemaining--;
        const timerNumEl = this.stage.querySelector('.builder-timer__num');
        const timerSvgCircle = this.stage.querySelector('.builder-timer__circle');
        const total = this.state.timerSec;
        const rem = Math.max(0, this.state.timerRemaining);

        if (timerNumEl) timerNumEl.textContent = rem;
        if (timerSvgCircle) {
          const circum = 2 * Math.PI * 15;
          const offset = circum * (1 - rem / total);
          timerSvgCircle.style.strokeDashoffset = offset;
          if (rem <= 5) {
            timerSvgCircle.style.stroke = '#ef4444';
          }
        }

        if (this.state.timerRemaining <= 0) {
          clearInterval(this.state.timerInterval);
          this.sound.play('wrong');
          this.handleAnswerTimeout();
        }
      }, 1000);
    }

    handleAnswerTimeout() {
      this.submitAnswer(-1);
    }

    submitAnswer(chosenOptionIdx) {
      if (this.state.phase !== 'answering' || !this.state.currentQuestion) return;
      clearInterval(this.state.timerInterval);

      const q = this.state.currentQuestion;
      const isCorrect = chosenOptionIdx === q.correctIndex;
      const currentTeam = this.state.currentTeam;

      if (!this.state.attemptedTeams.includes(currentTeam)) {
        this.state.attemptedTeams.push(currentTeam);
      }

      if (!isCorrect && chosenOptionIdx >= 0 && !this.state.lockedOptions.includes(chosenOptionIdx)) {
        this.state.lockedOptions.push(chosenOptionIdx);
      }

      const allTeamsAttempted = this.state.attemptedTeams.length >= this.teams.length;
      const outOfOptions = q.options.length - this.state.lockedOptions.length <= 1;
      const exhausted = !isCorrect && (allTeamsAttempted || outOfOptions);

      this.state.phase = 'feedback';
      this.state.feedback = {
        team: currentTeam,
        option: chosenOptionIdx,
        correct: isCorrect,
        exhausted
      };

      if (isCorrect) {
        this.sound.play('correct');
      } else {
        this.sound.play('wrong');
        // Apply 6 damage immediately to current team's house
        const { blocks } = applyDamage(this.state.houses[currentTeam], 6);
        this.state.houses[currentTeam] = blocks;
      }

      this.render();

      const delay = isCorrect ? 700 : exhausted ? 2200 : 1100;
      setTimeout(() => {
        this.onFeedbackDone();
      }, delay);
    }

    onFeedbackDone() {
      if (this.state.phase !== 'feedback' || !this.state.feedback) return;
      const fb = this.state.feedback;
      const bet = this.state.bet;

      if (fb.correct) {
        // Place block
        const hp = MATERIAL_HP[bet];
        this.state.houses[fb.team].push({ material: bet, hp });
        this.state.phase = 'placing';
        this.state.lastEvent = { t: 'placed', team: fb.team, material: bet };
        this.state.gainBadge = { team: fb.team, material: bet, hp };

        this.sound.play('correct');
        this.render();

        setTimeout(() => {
          this.state.gainBadge = null;
          this.onPlaceDone();
        }, 750);
        return;
      }

      // If wrong
      this.state.lastEvent = { t: 'missed', team: fb.team, penalty: 6 };

      if (fb.exhausted) {
        this.state.phase = 'placing';
        this.render();
        setTimeout(() => {
          this.onPlaceDone();
        }, 300);
        return;
      }

      // Steal Turn: Next untried team
      let nextTeam = null;
      for (let step = 1; step <= this.teams.length; step++) {
        const candidate = (fb.team + step) % this.teams.length;
        if (!this.state.attemptedTeams.includes(candidate)) {
          nextTeam = candidate;
          break;
        }
      }

      if (nextTeam === null) {
        this.state.phase = 'placing';
        this.render();
        setTimeout(() => {
          this.onPlaceDone();
        }, 300);
        return;
      }

      // Switch turn to stealer
      this.state.currentTeam = nextTeam;
      this.state.phase = 'answering';
      this.state.feedback = null;
      this.state.isStealTurn = true;
      this.state.timerRemaining = this.state.timerSec;
      this.render();
      this.startQuestionTimer();
    }

    onPlaceDone() {
      this.state.isStealTurn = false;
      const nextTurnsDone = this.state.turnsDone + 1;
      this.state.turnsDone = nextTurnsDone;

      // Check scheduled disaster
      const disaster = this.state.schedule.find(s => s.turn === nextTurnsDone);
      if (disaster) {
        this.triggerDisaster(disaster.kind);
        return;
      }

      // No disaster, proceed to next round/turn
      this.advanceToNextTurn();
    }

    triggerDisaster(kind) {
      this.state.phase = 'disaster';
      const spec = MONSTER_SPEC[kind];
      const damage = spec.damage;

      // Save pre-collapse blocks
      const collapsedCounts = [];
      const newHouses = this.state.houses.map(house => {
        const { blocks, destroyed } = applyDamage(house, damage);
        collapsedCounts.push(destroyed);
        return blocks;
      });

      this.state.lastEvent = { t: 'disaster', kind, collapsed: collapsedCounts };
      this.state.prevHousesBeforeDisaster = this.state.houses;
      this.state.houses = newHouses;

      this.sound.play('roar');
      this.render();

      // Trigger WebGL / SFX sequence
      setTimeout(() => {
        this.sound.play('swipe');
      }, 1200);

      setTimeout(() => {
        this.sound.play('smash');
      }, spec.hitDelay || 3450);

      setTimeout(() => {
        this.onDisasterDone();
      }, spec.dur || 5400);
    }

    onDisasterDone() {
      this.state.prevHousesBeforeDisaster = null;
      this.advanceToNextTurn();
    }

    advanceToNextTurn() {
      // Check game end conditions
      const totalTurnsLimit = Math.max(this.teams.length * 3, (this.options.limit || 18));
      const allMaterialsEmpty = MATERIALS.every(m => this.questionsByMaterial[m].filter(q => !this.state.usedQuestions.includes(q.id)).length === 0);

      if (this.state.turnsDone >= totalTurnsLimit || allMaterialsEmpty) {
        this.finishGame();
        return;
      }

      // Next team's regular turn
      const nextTurnTeam = (this.state.turnTeam + 1) % this.teams.length;
      this.state.turnTeam = nextTurnTeam;
      this.state.currentTeam = nextTurnTeam;
      this.state.bet = null;
      this.state.currentQuestion = null;
      this.state.lockedOptions = [];
      this.state.attemptedTeams = [];
      this.state.isStealTurn = false;
      this.state.feedback = null;
      this.state.phase = 'answering';
      this.state.lastEvent = null;

      this.render();
    }

    finishGame() {
      this.state.phase = 'finished';
      clearInterval(this.state.timerInterval);

      this.sound.play('whistle');
      setTimeout(() => this.sound.play('fanfare'), 350);

      this.render();

      const confettiCanvas = this.stage.querySelector('.builder-confetti-canvas');
      if (confettiCanvas) {
        this.confettiCleanup = runConfetti(confettiCanvas);
      }
    }

    togglePause() {
      this.state.isPaused = !this.state.isPaused;
      this.render();
    }

    adjustFontZoom(delta) {
      this.state.fontZoom = Math.min(this.zoomScales.length - 1, Math.max(0, this.state.fontZoom + delta));
      const qEl = this.stage.querySelector('.gq-q');
      const optEls = this.stage.querySelectorAll('.gq-opt');
      if (qEl) qEl.style.fontSize = this.zoomScales[this.state.fontZoom] + 'px';
      if (optEls) {
        optEls.forEach(el => el.style.fontSize = Math.max(13, this.zoomScales[this.state.fontZoom] - 3) + 'px');
      }
    }

    render() {
      if (!this.stage) return;
      const phase = this.state.phase;

      if (phase === 'setup') {
        this.renderSetup();
        return;
      }

      if (phase === 'intro') {
        this.renderIntro();
        return;
      }

      if (phase === 'finished') {
        this.renderVictory();
        return;
      }

      this.renderMainGame();
    }

    // SETUP SCREEN
    renderSetup() {
      this.stage.innerHTML = `
        ${renderSvgWorldBackground()}
        <div class="builder-start">
          <div class="builder-start__card">
            <div class="builder-start__hero" aria-hidden="true">
              <i class="builder-start__sun"></i>
              <div class="builder-start__town">
                ${this.teams.map((t, idx) => `
                  <div class="builder-start__mini" style="--i:${idx}">
                    <span class="builder-start__miniroof" style="background-image:url('${getRoofAssetForColor(t.color, idx)}')"></span>
                    <span class="builder-start__miniblock" style="background-image:url('${GROUND_MAT_IMAGES[MATERIALS[idx % 3]]}')"></span>
                  </div>
                `).join('')}
              </div>
            </div>

            <p class="builder-start__eyebrow">Xây nhà thi đua</p>
            <h1 class="builder-start__title">Thiết lập trận đấu</h1>

            <div class="builder-start__count">
              <span class="builder-start__count-label">Số đội</span>
              ${[2, 3, 4].map(n => `
                <button type="button" class="builder-start__countbtn ${this.teams.length === n ? 'is-on' : ''}" data-teams="${n}">
                  ${n}
                </button>
              `).join('')}
            </div>

            <div class="builder-start__teams" data-count="${this.teams.length}">
              ${this.teams.map((t, idx) => `
                <div class="builder-start__team" style="--c:${t.color}">
                  <button type="button" class="builder-start__swatch" style="background:${t.color}; cursor:pointer;" data-color-idx="${idx}" title="Đổi màu ${t.name}"></button>
                  <input type="text" class="builder-start__name" value="${t.name}" maxlength="16" data-name-idx="${idx}" placeholder="Đội ${idx + 1}"/>
                  ${getHouseIconSvg(t.color)}
                </div>
              `).join('')}
            </div>

            <div class="builder-start__actions">
              <button type="button" class="builder-btn builder-btn--primary builder-btn--start" id="builder-start-btn">
                ▶ Bắt đầu
              </button>
            </div>
          </div>
        </div>
      `;

      // Event listeners for Setup
      this.stage.querySelectorAll('.builder-start__countbtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const n = parseInt(btn.dataset.teams, 10);
          this.teams = Array.from({ length: n }, (_, i) => ({
            name: this.teams[i]?.name || DEFAULT_TEAM_NAMES[i],
            color: this.teams[i]?.color || COLOR_PALETTE[i]
          }));
          this.state.houses = Array.from({ length: n }, () => []);
          this.sound.play('tick');
          this.render();
        });
      });

      this.stage.querySelectorAll('.builder-start__name').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const idx = parseInt(inp.dataset.nameIdx, 10);
          this.teams[idx].name = inp.value || DEFAULT_TEAM_NAMES[idx];
        });
      });

      this.stage.querySelectorAll('.builder-start__swatch').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.dataset.colorIdx, 10);
          const curColor = this.teams[idx].color;
          const nextIdx = (COLOR_PALETTE.indexOf(curColor) + 1) % COLOR_PALETTE.length;
          this.teams[idx].color = COLOR_PALETTE[nextIdx];
          this.sound.play('tick');
          this.render();
        });
      });

      const startBtn = this.stage.querySelector('#builder-start-btn');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          const totalTurns = Math.max(this.teams.length * 3, (this.options.limit || 18));
          this.state.schedule = this.scheduleDisasters(totalTurns, this.teams.length);
          this.sound.play('tick');
          this.startIntroCountdown();
        });
      }
    }

    // INTRO SCREEN
    renderIntro() {
      this.stage.innerHTML = `
        ${renderSvgWorldBackground()}
        <div class="absolute inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-[4px] pointer-events-none"
             style="background:radial-gradient(circle at center, rgba(34,195,214,0.22) 0%, rgba(14,116,144,0.16) 45%, rgba(15,23,42,0.72) 100%)">
          <div class="flex flex-col items-center justify-center text-center" id="builder-intro-container">
            <div class="castle-intro-count text-[clamp(130px,28vh,280px)] font-black leading-none text-amber-500"
                 style="font-family:'Avenir Next','Arial Rounded MT Bold',ui-rounded,system-ui,sans-serif; -webkit-text-stroke:6px #0f766e; paint-order:stroke fill; text-shadow:0 12px 0 #115e59, 0 0 40px rgba(20,184,166,0.8);">
              3
            </div>
          </div>
        </div>
      `;
    }

    // MAIN GAMEPLAY RENDER
    renderMainGame() {
      const activeTeamIdx = this.state.currentTeam;
      const activeTeam = this.teams[activeTeamIdx];
      const highestFloors = Math.max(0, ...this.state.houses.map(h => h.length));
      const leaderIdx = highestFloors > 0 ? this.state.houses.findIndex(h => h.length === highestFloors) : -1;
      const isStealTurn = Boolean(this.state.isStealTurn && this.state.phase === 'answering');
      const disasterEvent = this.state.phase === 'disaster' && this.state.lastEvent?.t === 'disaster' ? this.state.lastEvent : null;
      const monsterSpec = disasterEvent ? MONSTER_SPEC[disasterEvent.kind] : null;

      this.stage.innerHTML = `
        ${renderSvgWorldBackground()}

        <!-- Top Header / Score Bar -->
        <header class="bh">
          <div class="bh-teams">
            ${this.teams.map((t, idx) => {
              const isTurn = idx === activeTeamIdx;
              const floors = this.state.houses[idx].length;
              const dur = getTeamDurability(this.state.houses[idx]);
              const isLeader = leaderIdx === idx && floors > 0;
              return `
                <div class="bh-team ${isTurn ? 'is-turn' : ''}" style="--c:${t.color}">
                  <span class="bh-team__badge">
                    ${getHouseIconSvg(t.color)}
                  </span>
                  <div class="bh-team__body">
                    <div class="bh-team__top">
                      <span class="bh-team__name">${t.name}</span>
                      ${isLeader ? '<span class="bh-team__lead" title="Nhà cao nhất">👑</span>' : ''}
                      ${isTurn ? '<span class="bh-team__turn">ĐANG XÂY</span>' : ''}
                    </div>
                    <div class="bh-team__stats">
                      <span class="bh-stat bh-stat--floor">${getFloorIconSvg()} ${floors} tầng</span>
                      <span class="bh-stat bh-stat--hp">${getShieldIconSvg()} ${dur}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="bh-tools">
            <button type="button" class="bh-tool" id="builder-btn-sound" title="${this.sound.enabled ? 'Tắt âm thanh' : 'Bật âm thanh'}">
              ${this.sound.enabled ? '🔊' : '🔇'}
            </button>
            <button type="button" class="bh-btn ${this.state.isPaused ? 'bh-btn--on' : ''}" id="builder-btn-pause">
              ${this.state.isPaused ? 'Tiếp tục' : 'Tạm dừng'}
            </button>
            <button type="button" class="bh-btn" id="builder-btn-end">
              Kết thúc
            </button>
          </div>
        </header>

        <!-- Left Monster Legend -->
        <aside class="builder-legend">
          <p class="builder-legend__title">Quái phá nhà</p>
          ${MONSTER_KINDS.map(k => {
            const m = MONSTER_SPEC[k];
            const isNow = disasterEvent?.kind === k;
            return `
              <div class="builder-legend__row ${isNow ? 'is-now' : ''}">
                <img src="${m.img}" alt="" class="builder-legend__img"/>
                <span class="builder-legend__name">${m.label}</span>
                <span class="builder-legend__dmg">−${m.damage}</span>
              </div>
            `;
          }).join('')}
        </aside>

        <!-- Material Selection Panel (if active team picking material) -->
        ${this.state.phase === 'answering' && !this.state.bet ? `
          <div class="builder-panel" style="--c:${activeTeam.color}">
            <p class="builder-panel__who">
              <span class="builder-panel__dot"></span>
              <b>${activeTeam.name}</b> chọn vật liệu để xây tầng mới
            </p>
            <div class="builder-materials__row">
              ${MATERIALS.map(m => {
                const spec = MATERIAL_SPEC[m];
                const unaskedCount = this.questionsByMaterial[m].filter(q => !this.state.usedQuestions.includes(q.id)).length;
                const hasQuestions = unaskedCount > 0;
                return `
                  <button type="button" class="builder-mat builder-mat--${m}" data-mat="${m}" ${!hasQuestions || this.state.isPaused ? 'disabled' : ''}>
                    <span class="builder-mat__thumb" style="--block-img:url('${UPPER_MAT_IMAGES[m]}')" aria-hidden="true"></span>
                    <div class="builder-mat__content">
                      <div class="builder-mat__name">
                        ${spec.label}
                        <span class="builder-mat__stars">
                          ${[1, 2, 3].map(s => `<i class="${s <= spec.stars ? 'is-on' : ''}">★</i>`).join('')}
                        </span>
                        <span class="builder-mat__dur">${getShieldIconSvg()} +${spec.hp}</span>
                      </div>
                      <div class="builder-mat__sub">
                        ${hasQuestions ? `<span>${spec.desc}</span> <span class="builder-mat__dot">·</span> <span class="builder-mat__count">còn ${unaskedCount} câu</span>` : '<span class="builder-mat__out">Hết câu</span>'}
                      </div>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
            ${isStealTurn ? `
              <p class="builder-q__steal">
                ⚡ Cướp lượt — <b style="color:${activeTeam.color}">${activeTeam.name}</b> trả lời thay
              </p>
            ` : ''}
          </div>
        ` : ''}

        <!-- Question Banner (when material picked) -->
        ${this.state.bet && this.state.currentQuestion ? `
          <div class="gq-card gq-pop builder-q" style="--gq-c:${activeTeam.color}; position:absolute; top:86px; left:50%; transform:translateX(-50%); z-index:40;">
            <div class="gq-header">
              <span class="gq-badge">CÂU ${this.state.turnsDone + 1}</span>
              <span class="builder-q__mat-badge builder-q__mat-badge--${this.state.bet}">
                ${this.state.bet === 'rom' ? '🌾' : this.state.bet === 'go' ? '🪵' : '🧱'} ${MATERIAL_SPEC[this.state.bet].label}
              </span>
              <div class="gq-q" style="font-size:${this.zoomScales[this.state.fontZoom]}px;">
                ${this.state.currentQuestion.text}
              </div>
              <div class="gq-zoom-controls">
                <button type="button" class="gq-zoom-btn" id="builder-zoom-out" title="Thu nhỏ chữ">A−</button>
                <button type="button" class="gq-zoom-btn" id="builder-zoom-in" title="Phóng to chữ">A+</button>
              </div>
              <div class="builder-timer ${this.state.timerRemaining <= 5 ? 'is-urgent' : ''}">
                <svg viewBox="0 0 38 38" class="builder-timer__svg">
                  <defs>
                    <linearGradient id="bdTimerG" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stop-color="#2dd4bf"/>
                      <stop offset="1" stop-color="#0284c7"/>
                    </linearGradient>
                  </defs>
                  <circle cx="19" cy="19" r="15" fill="#fff" stroke="rgba(0,0,0,0.07)" stroke-width="3.5"/>
                  <circle cx="19" cy="19" r="15" fill="none" class="builder-timer__circle"
                          stroke="${this.state.timerRemaining <= 5 ? '#ef4444' : 'url(#bdTimerG)'}" stroke-width="3.5"
                          stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 15}"
                          stroke-dashoffset="${(2 * Math.PI * 15) * (1 - Math.max(0, this.state.timerRemaining) / this.state.timerSec)}"
                          style="transition:stroke-dashoffset 0.2s linear, stroke 0.2s ease; transform:rotate(-90deg); transform-origin:center;"/>
                </svg>
                <span class="builder-timer__num">${Math.max(0, this.state.timerRemaining)}</span>
              </div>
            </div>

            <div class="gq-grid">
              ${this.state.currentQuestion.options.map((opt, oIdx) => {
                const isLocked = this.state.lockedOptions.includes(oIdx);
                const isCorrect = this.state.feedback && (this.state.feedback.correct || this.state.feedback.exhausted) && oIdx === this.state.currentQuestion.correctIndex;
                const isWrong = this.state.feedback && !this.state.feedback.correct && this.state.feedback.option === oIdx;
                let stateCls = '';
                if (isCorrect) stateCls = 'is-correct';
                else if (isWrong) stateCls = 'is-wrong';
                else if (isLocked) stateCls = 'is-locked';

                return `
                  <button type="button" class="gq-opt ${stateCls}" data-opt-idx="${oIdx}" ${isLocked || this.state.phase !== 'answering' || this.state.isPaused ? 'disabled' : ''}>
                    <b class="gq-opt__k">${String.fromCharCode(65 + oIdx)}.</b>
                    <span style="flex:1;">${opt}</span>
                    ${isCorrect ? '<span style="color:#16a34a; font-weight:900;">✓</span>' : ''}
                    ${isWrong ? '<span style="color:#ef4444; font-weight:900;">✗</span>' : ''}
                    ${isLocked && !isWrong ? '<span style="opacity:0.6;">×</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>

            ${isStealTurn ? `
              <p class="builder-q__steal">
                ⚡ Cướp lượt — <b style="color:${activeTeam.color}">${activeTeam.name}</b> trả lời thay
              </p>
            ` : ''}
          </div>
        ` : ''}

        <!-- Houses Yard -->
        <div class="builder-yard" data-teams="${this.teams.length}">
          ${this.teams.map((t, idx) => {
            const isTurn = idx === activeTeamIdx;
            const isLeader = leaderIdx === idx && highestFloors > 0;
            const isHoist = this.state.phase === 'placing' && this.state.gainBadge?.team === idx;
            const isHurt = this.state.feedback && !this.state.feedback.correct && this.state.feedback.team === idx;
            const houseBlocks = (this.state.prevHousesBeforeDisaster && disasterEvent) ? this.state.prevHousesBeforeDisaster[idx] : this.state.houses[idx];
            const doomedCount = disasterEvent ? (disasterEvent.collapsed[idx] || 0) : 0;
            const isDrop = doomedCount > 0;
            const shakeClass = disasterEvent ? 'is-shaking' : isHurt ? 'is-hurt' : '';
            const roofUrl = getRoofAssetForColor(t.color, idx);

            return `
              <div class="builder-plot ${isTurn ? 'is-turn' : ''}" style="--c:${t.color}">
                ${isTurn ? '<span class="builder-beam" aria-hidden="true"></span>' : ''}
                <div class="builder-fit">
                  <div class="builder-house ${shakeClass}">
                    <div class="builder-top">
                      ${isTurn ? '<span class="builder-turnmark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 9 L12 16 L19 9"/></svg></span>' : ''}
                      ${isLeader ? getCrownSvg() : ''}
                      ${disasterEvent && (houseBlocks.length > 0 || doomedCount > 0) ? `
                        <div class="builder-hit ${doomedCount > 0 ? 'builder-hit--fall' : ''}">
                          ${doomedCount > 0 ? `Sập ${doomedCount} tầng` : `−${monsterSpec.damage} độ bền`}
                        </div>
                      ` : ''}
                      ${isHurt ? '<div class="builder-hit builder-hit--now">−6 độ bền</div>' : ''}
                      ${isHoist && this.state.gainBadge ? `
                        <div class="builder-gain">
                          <b>+1 tầng</b>
                          <span>${getShieldIconSvg()} +${this.state.gainBadge.hp}</span>
                        </div>
                      ` : ''}
                    </div>

                    <span class="builder-roof ${isHoist ? 'is-hoist' : ''} ${isDrop ? 'is-drop' : ''}" style="--roof-img:url('${roofUrl}')">
                      ${isHoist ? getCraneHookSvg() : ''}
                      <span class="builder-chimney" aria-hidden="true">
                        ${houseBlocks.length > 0 ? '<i class="builder-smoke"></i><i class="builder-smoke"></i><i class="builder-smoke"></i>' : ''}
                      </span>
                    </span>

                    ${[...houseBlocks].reverse().map((b, rIdx) => {
                      const actualIdx = houseBlocks.length - 1 - rIdx;
                      const isGround = (actualIdx === 0);
                      const isDoomed = rIdx < doomedCount;
                      const isCracked = b.hp < MATERIAL_HP[b.material];
                      const isNew = (rIdx === 0 && isHoist && !isDoomed);
                      const imgUrl = isGround ? GROUND_MAT_IMAGES[b.material] : UPPER_MAT_IMAGES[b.material];

                      return `
                        <span class="builder-block builder-block--${b.material} ${isGround ? 'is-ground' : ''} ${isNew ? 'is-new' : ''} ${isCracked ? 'is-cracked' : ''} ${isDoomed ? 'is-doomed' : ''}"
                              style="--block-img:url('${imgUrl}'); --k:${rIdx}">
                          ${isNew ? `
                            <i class="builder-dust" aria-hidden="true">${Array.from({length:8}, (_,d)=>`<i style="--d:${d}"></i>`).join('')}</i>
                            <i class="builder-spark" aria-hidden="true">${Array.from({length:10}, (_,d)=>`<i style="--d:${d}"></i>`).join('')}</i>
                          ` : ''}
                          ${isDoomed ? `
                            <i class="builder-shards" aria-hidden="true">
                              ${SHARDS_DATA.map((s, a) => `<i style="--cx:${s.cx};--cy:${s.cy};--vx:${s.vx};--up:${s.up};--rot:${s.rot}deg;--lag:${s.lag + 0.05 * rIdx}s"></i>`).join('')}
                            </i>
                            <i class="builder-rubble" aria-hidden="true">${Array.from({length:9}, (_,d)=>`<i style="--d:${d}"></i>`).join('')}</i>
                            <i class="builder-plume" aria-hidden="true">${Array.from({length:7}, (_,d)=>`<i style="--d:${d}"></i>`).join('')}</i>
                          ` : ''}
                        </span>
                      `;
                    }).join('')}

                    ${isHurt ? '<i class="builder-puff" aria-hidden="true"></i>' : ''}
                  </div>

                  <span class="builder-base" aria-hidden="true"></span>
                  <span class="builder-flag" aria-hidden="true">
                    <svg viewBox="0 0 60 120">
                      <rect x="4" y="6" width="4" height="114" rx="2" fill="url(#bdPole)"/>
                      <circle cx="6" cy="6" r="4.2" fill="#ffd34d" stroke="#c28a00" stroke-width="1"/>
                      <path class="builder-flag__cloth" d="M8 12 C20 8 30 18 44 13 C50 11 55 12 58 13 L58 44 C54 43 50 42 44 44 C30 49 20 39 8 43 Z" fill="${t.color}"/>
                      <path class="builder-flag__cloth builder-flag__shine" d="M8 12 C20 8 30 18 44 13 C50 11 55 12 58 13 L58 44 C54 43 50 42 44 44 C30 49 20 39 8 43 Z" fill="url(#bdFlagShine)"/>
                      <text x="31" y="34" text-anchor="middle" class="builder-flag__num">${idx + 1}</text>
                    </svg>
                  </span>
                </div>
              </div>
            `;
          }).join('')}

          <svg width="0" height="0" class="absolute" aria-hidden="true">
            <defs>
              <linearGradient id="bdPole" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#f5f5f5"/>
                <stop offset="1" stop-color="#9aa4b2"/>
              </linearGradient>
              <linearGradient id="bdFlagShine" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#fff" stop-opacity="0.45"/>
                <stop offset="0.5" stop-color="#fff" stop-opacity="0"/>
                <stop offset="1" stop-color="#000" stop-opacity="0.18"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Monster Attack FX Overlay -->
        ${disasterEvent && monsterSpec ? `
          <div class="builder-attack builder-attack--${monsterSpec.effect}" aria-hidden="true">
            <div class="builder-attack__beast">
              <span class="builder-attack__shadow"></span>
              <span class="builder-attack__dust">${Array.from({length:7}, (_,d)=>`<i style="--d:${d}"></i>`).join('')}</span>
              <img src="${monsterSpec.img}" alt="" class="builder-attack__img" draggable="false"/>
            </div>
          </div>
          <div class="builder-attack-fx builder-attack-fx--${monsterSpec.effect}" aria-hidden="true">
            <div class="builder-attack__veil"></div>
            ${monsterSpec.effect === 'claw' ? `
              <div class="builder-attack__claws">
                ${Array.from({length: monsterSpec.hits}, (_,h)=>`
                  <div class="builder-attack__claw" style="--h:${h}"><i></i><i></i><i></i></div>
                `).join('')}
              </div>
            ` : `
              <div class="builder-attack__flash"></div>
              <div class="builder-attack__ring"></div>
              <div class="builder-attack__ring builder-attack__ring--2"></div>
              <div class="builder-attack__rocks">
                ${Array.from({length:12}, (_,d)=>`<i style="--d:${d}"></i>`).join('')}
              </div>
            `}
          </div>
        ` : ''}
      `;

      // Attach event listeners for gameplay
      this.attachGameplayListeners();

      // Render KaTeX for questions & options
      const qModal = this.stage.querySelector('.builder-q');
      if (qModal && window.FileParser && typeof window.FileParser.renderMath === 'function') {
        window.FileParser.renderMath(qModal);
      }
    }

    attachGameplayListeners() {
      // Sound toggle
      const soundBtn = this.stage.querySelector('#builder-btn-sound');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          this.sound.enabled = !this.sound.enabled;
          soundBtn.textContent = this.sound.enabled ? '🔊' : '🔇';
          if (this.sound.enabled) this.sound.play('tick');
        });
      }

      // Pause toggle
      const pauseBtn = this.stage.querySelector('#builder-btn-pause');
      if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
          this.togglePause();
        });
      }

      // End game
      const endBtn = this.stage.querySelector('#builder-btn-end');
      if (endBtn) {
        endBtn.addEventListener('click', () => {
          this.showEndConfirm();
        });
      }

      // Material buttons
      this.stage.querySelectorAll('.builder-mat').forEach(btn => {
        btn.addEventListener('click', () => {
          const mat = btn.dataset.mat;
          this.selectMaterial(mat);
        });
      });

      // Question option buttons
      this.stage.querySelectorAll('.gq-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const optIdx = parseInt(btn.dataset.optIdx, 10);
          this.submitAnswer(optIdx);
        });
      });

      // Font zoom buttons
      const zoomIn = this.stage.querySelector('#builder-zoom-in');
      const zoomOut = this.stage.querySelector('#builder-zoom-out');
      if (zoomIn) zoomIn.addEventListener('click', () => this.adjustFontZoom(1));
      if (zoomOut) zoomOut.addEventListener('click', () => this.adjustFontZoom(-1));
    }

    showEndConfirm() {
      const confirmBox = document.createElement('div');
      confirmBox.className = 'builder-confirm';
      confirmBox.innerHTML = `
        <div class="builder-confirm__card">
          <p class="builder-confirm__text">
            Kết thúc trận bây giờ? Đội xây nhà cao nhất (nhiều tầng nhất) sẽ giành chiến thắng!
          </p>
          <div class="builder-confirm__actions">
            <button type="button" class="builder-btn builder-btn--ghost" id="confirm-cancel">Huỷ</button>
            <button type="button" class="builder-btn builder-btn--primary" id="confirm-ok">Kết thúc</button>
          </div>
        </div>
      `;
      this.stage.appendChild(confirmBox);

      confirmBox.querySelector('#confirm-cancel').addEventListener('click', () => confirmBox.remove());
      confirmBox.querySelector('#confirm-ok').addEventListener('click', () => {
        confirmBox.remove();
        this.finishGame();
      });
    }

    // VICTORY SCREEN
    renderVictory() {
      const rankedTeams = this.teams.map((t, idx) => ({
        team: t,
        idx,
        floors: this.state.houses[idx].length,
        hp: getTeamDurability(this.state.houses[idx])
      })).sort((a, b) => b.floors - a.floors || b.hp - a.hp);

      const winner = rankedTeams[0];
      const maxFloors = Math.max(1, winner.floors);
      const topTied = rankedTeams.filter(t => t.floors === winner.floors && t.hp === winner.hp);
      const isTie = topTied.length > 1;
      const winnerEyebrow = isTie ? 'HOÀ · ĐỒNG VÔ ĐỊCH' : 'VÔ ĐỊCH';
      const winnerName = isTie ? topTied.map(t => t.team.name).join(' & ') : winner.team.name;
      const medals = ["🥇", "🥈", "🥉", "🏅"];

      this.stage.innerHTML = `
        ${renderSvgWorldBackground()}
        <canvas class="builder-confetti-canvas"></canvas>
        <div class="builder-finish">
          <div class="builder-finish__card" style="--c:${winner.team.color}">
            <div class="builder-finish__hero">
              <i class="builder-finish__rays" aria-hidden="true"></i>
              <div class="builder-finish__trophy" aria-hidden="true">🏆</div>
              <p class="builder-finish__eyebrow">${winnerEyebrow}</p>
              <p class="builder-finish__winner">${winnerName}</p>
            </div>

            <ol class="builder-finish__rank">
              ${rankedTeams.map((item, rIdx) => {
                const pct = Math.max(8, Math.round((item.floors / maxFloors) * 100));
                return `
                  <li class="builder-finish__row ${rIdx === 0 ? 'is-first' : ''}" style="--c:${item.team.color}; --w:${pct}%; --i:${rIdx}">
                    <span class="builder-finish__medal">${medals[rIdx] || (rIdx + 1)}</span>
                    <span class="builder-finish__team">
                      <b>${item.team.name}</b>
                      <i class="builder-finish__bar"><i style="width:${pct}%;"></i></i>
                    </span>
                    <span class="builder-finish__stats">
                      <span>${getFloorIconSvg()} ${item.floors} tầng</span>
                      <span class="builder-finish__hp">${getShieldIconSvg()} ${item.hp}</span>
                    </span>
                  </li>
                `;
              }).join('')}
            </ol>

            <div class="builder-finish__actions">
              <button type="button" class="builder-btn builder-btn--primary" id="builder-btn-replay">
                ↻ Chơi lại
              </button>
              <button type="button" class="builder-btn builder-btn--ghost" id="builder-btn-exit">
                Về danh sách
              </button>
            </div>
          </div>
        </div>
      `;

      const replayBtn = this.stage.querySelector('#builder-btn-replay');
      const exitBtn = this.stage.querySelector('#builder-btn-exit');

      if (replayBtn) {
        replayBtn.addEventListener('click', () => {
          if (this.confettiCleanup) this.confettiCleanup();
          this.state.houses = Array.from({ length: this.teams.length }, () => []);
          this.state.turnsDone = 0;
          this.state.turnTeam = 0;
          this.state.currentTeam = 0;
          this.state.usedQuestions = [];
          this.state.phase = 'setup';
          this.render();
        });
      }

      if (exitBtn) {
        exitBtn.addEventListener('click', () => {
          this.destroy();
          this.onExit();
        });
      }
    }

    destroy() {
      clearInterval(this.state.timerInterval);
      if (this.confettiCleanup) this.confettiCleanup();
      if (this.resizeObs) this.resizeObs.disconnect();
      if (this.stage && this.stage.parentNode) {
        this.stage.parentNode.removeChild(this.stage);
      }
    }
  }

  // Export launcher
  global.launchXayNhaGame = function(container, options = {}) {
    const game = new XayNhaGame(container, options);
    global.__currentXayNhaGame = game;
    return () => {
      game.destroy();
      if (global.__currentXayNhaGame === game) global.__currentXayNhaGame = null;
    };
  };

  global.XayNhaGame = XayNhaGame;

})(typeof window !== 'undefined' ? window : this);
