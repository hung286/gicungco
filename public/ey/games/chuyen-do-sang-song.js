/**
 * Chuyến Đò Sang Sông (PomyAI - Chuẩn 100% cơ chế & đồ họa gốc)
 * Trò chơi gọi tên học sinh ngẫu nhiên tương tác trực tiếp
 * Tích hợp cho nền tảng EY (Trò chơi gọi tên - goiTen)
 */

(function(globalScope) {
  'use strict';

  const CSS_STYLES = `.cd-shell{background:#1e3a46}.cd-lop{pointer-events:none;z-index:20;position:absolute;inset:0;overflow:hidden}.cd-ten{color:#134e4a;white-space:nowrap;will-change:transform;background:#f0fdfaeb;border:1px solid #0d94888c;border-radius:6px;padding:0 5px;font-weight:800;line-height:1.35;position:absolute;top:0;left:0}.cd-ten.is-nguy{color:#92400e;background:#fffbeb;border-color:#d97706;animation:.55s ease-in-out infinite cd-tim}.cd-ten.is-chon{color:#fff;background:#0f766e;border:2px solid #fde68a;border-radius:10px;padding:2px 12px;animation:none;box-shadow:0 4px #134e4a}@keyframes cd-tim{0%,to{box-shadow:0 0 #d9770699}30%{box-shadow:0 0 0 7px #d9770600}}.cd-lop-thoai{z-index:22}.cd-thoai{color:#1c1917;max-width:300px;font-family:var(--font-game,var(--font-sans)), system-ui, sans-serif;text-align:center;will-change:transform;background:#fff;border:3px solid #1c1917;border-radius:18px;padding:8px 16px;font-size:clamp(15px,1.35vw,22px);font-weight:800;line-height:1.25;position:absolute;top:0;left:0;box-shadow:0 4px #1c191759}.cd-thoai:after{content:"";top:100%;left:calc(50% + var(--duoi,0px) - 10px);border:10px solid #0000;border-top:14px solid #1c1917;border-bottom:0;position:absolute}.cd-chu{font-family:var(--font-game,var(--font-sans)), system-ui, sans-serif;color:#fef3c7;-webkit-text-stroke:3px #0c4a6e;paint-order:stroke fill;text-shadow:0 5px #0c4a6e;white-space:nowrap;will-change:transform, opacity;font-size:clamp(26px,2.8vw,44px);font-weight:900;position:absolute;top:0;left:0}.cd-chu--lon{color:#f0f9ff;-webkit-text-stroke:6px #0c4a6e;text-shadow:0 9px #082f49;font-size:clamp(54px,7.5vw,120px)}.cd-tai{z-index:30;color:#083344;text-align:center;background:linear-gradient(#bae6fd,#67e8f9 60%,#0e7490);flex-direction:column;justify-content:center;align-items:center;gap:18px;padding:24px;font-size:20px;font-weight:800;display:flex;position:absolute;inset:0}.cd-tai__song{gap:8px;display:flex}.cd-tai__song span{border:5px solid #0e7490;border-top:0;border-radius:0 0 46px 46px;width:46px;height:14px;animation:1.1s ease-in-out infinite cd-nhap}.cd-tai__song span:nth-child(2){animation-delay:.18s}.cd-tai__song span:nth-child(3){animation-delay:.36s}@keyframes cd-nhap{50%{transform:translateY(-8px)}}.cd-sanh{z-index:30;pointer-events:none;flex-direction:column;justify-content:flex-start;align-items:center;padding:72px 16px 16px;display:flex;position:absolute;inset:0}.cd-sanh>*{pointer-events:auto}.cd-sanh__hop{text-align:center;background:#fffbebf0;border:4px solid #0e7490;border-radius:24px;flex-direction:column;align-items:center;gap:12px;max-width:min(640px,100%);padding:18px 28px 22px;display:flex;box-shadow:0 8px #155e75}.cd-sanh__ten{font-family:var(--font-game,var(--font-sans)), system-ui, sans-serif;color:#0e7490;font-size:clamp(26px,3vw,42px);font-weight:900;line-height:1.1}.cd-sanh__so{color:#155e75;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;font-weight:800;display:flex}.cd-sanh__so span{margin-right:6px}.cd-sanh__so button{color:#0e7490;cursor:pointer;background:#fff;border:3px solid #0e7490;border-radius:12px;width:40px;height:40px;font-size:18px;font-weight:900}.cd-sanh__so button.is-on{color:#fff;background:#0e7490}.cd-ghi-cong{color:#e2e8f0;background:#0f172a8c;border-radius:999px;max-width:calc(100% - 24px);padding:3px 10px;font-size:12px;position:absolute;bottom:10px;left:12px}.cd-nut{appearance:none;cursor:pointer;color:#fff;background:#0e7490;border:3px solid #fde68a;border-radius:18px;padding:12px 34px;font-size:clamp(17px,1.5vw,24px);font-weight:900;transition:transform .12s;box-shadow:0 6px #164e63}.cd-nut:hover{transform:translateY(-2px)}.cd-nut:active{transform:translateY(4px);box-shadow:0 2px #164e63}.cd-nut:disabled{opacity:.5;cursor:default}.cd-nut--lon{padding:14px 60px;font-size:clamp(22px,2vw,32px)}.cd-goi-y{z-index:30;color:#e2e8f0;background:#0f172a8c;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:600;position:absolute;bottom:14px;right:16px}.cd-the-nen{z-index:40;background:linear-gradient(#082f498c,#082f4926 55%,#0000 75%);justify-content:center;align-items:flex-start;padding:64px 16px 16px;display:flex;position:absolute;inset:0}.cd-the-khung{flex-direction:column;align-items:center;width:min(760px,100%);display:flex}.cd-the__du{z-index:1;justify-content:center;margin-bottom:-40px;display:flex;position:relative}.cd-the__nhan{color:#fffbeb;letter-spacing:.1em;white-space:nowrap;background:#b45309;border:3px solid #fffbeb;border-radius:999px;padding:6px 18px;font-size:clamp(12px,1.15vw,17px);font-weight:900;box-shadow:0 3px #78350f}.cd-the{color:#f8fafc;text-align:center;background:radial-gradient(at 30% 20%,#2f5d4b,#1f3f33 70%);border:10px solid #8b5a2b;border-radius:18px;width:100%;margin-top:22px;padding:34px clamp(20px,4vw,48px) 26px;position:relative;box-shadow:inset 0 0 0 3px #5c3a1a,0 10px #5c3a1a,0 24px 56px #02061780;container-type:inline-size}.cd-the__ten{font-family:var(--font-game,var(--font-sans)), system-ui, sans-serif;color:#fefce8;white-space:nowrap;max-width:100%;font-weight:900;line-height:1.15;font-size:min(92px, calc(150cqi / var(--n,10)));text-shadow:0 0 2px #fffc,2px 3px #00000040}.cd-the__phu{color:#d9f99d;margin-top:8px;font-size:clamp(15px,1.4vw,21px);font-weight:700}.cd-the__nut{flex-wrap:wrap;justify-content:center;gap:14px;margin-top:18px;display:flex}   #cd-canvas {   position: absolute !important;   inset: 0 !important;   width: 100% !important;   height: 100% !important;   display: block !important;   cursor: pointer !important; } .cd-shell {   position: absolute !important;   inset: 0 !important;   width: 100% !important;   height: 100% !important;   overflow: hidden !important;   background: #1e3a46 !important; } .mooncake-topbar {   display: flex !important;   align-items: center !important;   justify-content: space-between !important;   padding: 10px 18px !important;   position: absolute !important;   top: 0 !important;   left: 0 !important;   right: 0 !important;   z-index: 50 !important;   pointer-events: auto !important; } .mooncake-topbar__info {   display: flex !important;   align-items: center !important;   gap: 12px !important; } .tg-teacher-switcher {   display: flex !important;   align-items: center !important;   gap: 4px !important;   background: rgba(255, 255, 255, 0.95) !important;   padding: 4px 6px !important;   border-radius: 12px !important;   border: 1.5px solid #0d9488 !important;   box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15) !important; } .tg-teacher-btn {   border: none !important;   border-radius: 8px !important;   padding: 6px 14px !important;   font-size: 13.5px !important;   font-weight: 800 !important;   cursor: pointer !important;   display: inline-flex !important;   align-items: center !important;   gap: 6px !important;   transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;   background: transparent !important;   color: #64748b !important; } .tg-teacher-btn.is-active {   background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%) !important;   color: #ffffff !important;   box-shadow: 0 2px 6px rgba(13, 148, 136, 0.35) !important; } .tg-teacher-btn:not(.is-active):hover {   background: rgba(13, 148, 136, 0.08) !important;   color: #0d9488 !important; } .cd-edit-btn {   background: transparent !important;   border: none !important;   cursor: pointer !important;   font-size: 14px !important;   padding: 2px 4px !important;   border-radius: 6px !important;   transition: all 0.15s !important; } .cd-edit-btn:hover {   background: rgba(13, 148, 136, 0.15) !important;   transform: scale(1.1) !important; } .cd-topbar-btn {   padding: 6px 14px !important;   border-radius: 10px !important;   font-weight: 700 !important;   font-size: 14px !important;   cursor: pointer !important;   border: 1px solid #cbd5e1 !important;   background: rgba(255,255,255,0.92) !important;   color: #334155 !important;   transition: all 0.15s !important;   box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important; } .cd-topbar-btn:hover {   background: #ffffff !important;   transform: translateY(-1px) !important; } .cd-bang-nen {   position: absolute !important;   bottom: 20px !important;   left: 0 !important;   right: 0 !important;   display: flex !important;   justify-content: center !important;   pointer-events: none !important;   z-index: 45 !important; } .cd-bang-nen.hidden, .cd-bang-nen[style*="display: none"], .cd-bang-nen[style*="display:none"] {   display: none !important; } .cd-bang {   pointer-events: auto !important;   background: rgba(255, 255, 255, 0.96) !important;   border: 3px solid #0e7490 !important;   box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35) !important;   border-radius: 24px !important;   padding: 16px 28px !important;   display: flex !important;   flex-direction: column !important;   align-items: center !important;   gap: 12px !important;   max-width: 90vw !important;   backdrop-filter: blur(10px) !important; } .cd-bang__hang {   display: flex !important;   align-items: center !important;   gap: 8px !important; } .cd-nhan {   font-weight: 800 !important;   color: #0e7490 !important;   font-size: 15px !important;   margin-right: 6px !important; } .cd-nut-so {   width: 42px !important;   height: 42px !important;   border-radius: 12px !important;   border: 2.5px solid #cbd5e1 !important;   background: #f8fafc !important;   font-weight: 900 !important;   font-size: 17px !important;   color: #334155 !important;   cursor: pointer !important;   transition: all 0.15s ease !important; } .cd-nut-so.cd-nut-so--chon, .cd-nut-so.is-on {   border-color: #0e7490 !important;   background: #0e7490 !important;   color: #ffffff !important;   box-shadow: 0 4px 14px rgba(14, 116, 144, 0.45) !important;   transform: scale(1.05) !important; } .cd-nut {   display: inline-flex !important;   align-items: center !important;   justify-content: center !important;   border: none !important;   font-weight: 900 !important;   cursor: pointer !important;   transition: all 0.15s ease !important;   font-family: inherit !important; } .cd-nut--lon {   background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%) !important;   color: #ffffff !important;   font-size: 20px !important;   padding: 12px 42px !important;   border-radius: 18px !important;   border: 2px solid #5eead4 !important;   box-shadow: 0 6px 18px rgba(13, 148, 136, 0.45) !important; } .cd-nut--lon:hover {   transform: translateY(-2px) !important;   box-shadow: 0 8px 22px rgba(13, 148, 136, 0.55) !important; } .cd-the-nen {   position: absolute !important;   inset: 0 !important;   background: rgba(15, 23, 42, 0.7) !important;   backdrop-filter: blur(6px) !important;   display: none !important;   align-items: center !important;   justify-content: center !important;   z-index: 60 !important; } .cd-the-nen.open, #cd-result-modal.open {   display: flex !important; } .cd-hop {   background: #ffffff !important;   border-radius: 28px !important;   box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3) !important;   padding: 32px 36px !important;   text-align: center !important;   max-width: 520px !important;   width: 90vw !important; } .cd-hop__moi {   font-size: 26px !important;   font-weight: 900 !important;   color: #0f766e !important;   margin: 0 0 18px 0 !important; } .cd-hop__ds {   display: flex !important;   flex-wrap: wrap !important;   justify-content: center !important;   gap: 12px !important;   margin-bottom: 24px !important; } .cd-hop__ten {   background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%) !important;   color: #115e59 !important;   border: 2px solid #5eead4 !important;   padding: 10px 22px !important;   border-radius: 16px !important;   font-weight: 900 !important;   font-size: clamp(20px, 3vw, 30px) !important;   box-shadow: 0 4px 12px rgba(13, 148, 136, 0.18) !important; } `;

  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('ferry-styles')) return;
    const style = document.createElement('style');
    style.id = 'ferry-styles';
    style.textContent = CSS_STYLES;
    document.head.appendChild(style);
  }

  // 1. Nickname Generator
  
const getShortNames = (function() {
  function t(e){let t={},a=new Map(e.map(e=>[e,e.trim().split(/\s+/).filter(Boolean)])),n=Math.max(0,...[...a.values()].map(e=>e.length)),i=(e,t)=>(a.get(e)??[]).slice(-t).join(" ");for(let a=1;a<n;a++){let n=new Map;for(let r of e)t[r]||n.set(i(r,a),(n.get(i(r,a))??0)+1);let r=new Set(Object.values(t));for(let o of e)t[o]||1!==n.get(i(o,a))||r.has(i(o,a))||(t[o]=i(o,a))}for(let a of e)t[a]??=a.trim();return t}
  return t;
})();


  // 2. Ferry Logic & Planner
  
const FerryLogic = (function() {
  let exports = {};
  let e = { s: function(arr) {
    for (let i = 0; i < arr.length; i += 3) {
      exports[arr[i]] = arr[i+2];
    }
  } };

  "use strict";let t=(e,t=0,a=1)=>Math.max(t,Math.min(a,e)),a=e=>{let a=t(e);return a*a*(3-2*a)},n=["nam1","nam2","nam3","nam4","nam5","nam6","nu1","nu2","nu3","nu4","nu5","nu6"],r=["xoay","lucBinh","set","ca"],i={gioDau:8,gioBao:3,baoDau:11,baoNoi:5,songVo:1.6,voTanh:1.6,tanhCap:3,capLen:1.4,lenToiDa:6,lenToiDaNoi:4,lenMoiEm:.7,ba:3.6,baNoi:3,cuoi:4.6,cuoiNoi:4,diuThem:1.5,nhay:.45,diu:1.6},o={nam1:"Ai tắt đèn vậy?",nam2:"Ăn cho đỡ sợ!",nam3:"Nhà di động nè!",nam4:"Mẹ ơiii!",nam5:"Lên xu hướng rồi!",nam6:"Ướt sách là hết ôn!",nu1:"Để em phụ {gv}!",nu2:"Trân châu của tui!",nu3:"Đừng bỏ tui!",nu4:"Tóc tui!!",nu5:"{Gv} ơi em che cho!",nu6:"Khò… khò…"},s={nam1:"Em lau kính xíu {gv}!",nam2:"Cho em ăn nốt miếng!",nam3:"Em đang dọn cặp!",nam4:"Em hết run rồi… chưa?",nam5:"Cho em quay nốt cái clip!",nam6:"Em kiểm tra sách đã!",nu1:"Em tát nốt gáo nước!",nu2:"Còn hai hạt trân châu!",nu3:"Em sợ quá {gv} ơi!",nu4:"Em chỉnh tóc xíu!",nu5:"Cái ô của em…",nu6:"Khò… khò…"},c=["Em cảm ơn {gv} ạ!","Chào {gv} ạ!","{Gv} nghỉ ngơi nha {gv}!","Em thương {gv}!","Mai gặp {gv} ạ!"];function u(e,t){let a="thay"===t?"thầy":"cô";return e.replaceAll("{gv}",a).replaceAll("{Gv}",a[0].toUpperCase()+a.slice(1))}function l(e,t){let{M:n}=e;return t<n.gio?0:t<n.bao?.6*a((t-n.gio)/(n.bao-n.gio)):t<n.song?.6+.4*a((t-n.bao)/2.5):t<n.songVo+.4?1+.25*a((t-n.song)/(n.songVo-n.song)):1.25*(1-a((t-n.songVo-.4)/(n.tanh+1.4-n.songVo-.4)))}

  e.s(["K",0,"gv","$",0,"lop","E",0,i,"A",0,r,"u",0,l,"D",0,function(e,t,a=Math.random){let r=e=>{let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(a()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t},i=r(n.slice(0,6)),o=r(n.slice(6)),s=r(n),c=0,u=0,l=0,h={};for(let a of e){let e=t?.[a];h[a]="nam"===e?i[c++%6]:"nu"===e?o[u++%6]:s[l++%12]}return h},"G",0,t,"b",0,function(e){let{M:t}=e,a=[];for(let n of(e.noi||(a.push({t:.1,ten:"roi"}),a.push({t:2,ten:"dap"})),a.push({t:t.gio+.2,ten:"non"}),a.push({t:t.gio,ten:"gio"},{t:t.bao,ten:"bao"},{t:t.song,ten:"song"},{t:t.songVo,ten:"vo"},{t:t.tanh,ten:"tanh"},{t:t.cap,ten:"cap"}),e.set))a.push({t:n,ten:"set"});for(let t of("set"!==e.tinhTiet&&a.push({t:e.tTinhTiet,ten:e.tinhTiet}),e.lenBo))a.push({t:t.t+.9*i.nhay,ten:"buoc"});let n=e.lenBo.find(e=>e.quen);for(let t of(n&&a.push({t:n.quen.tVe-.5,ten:"quen"}),e.hai))a.push({t:t.t0+.5,ten:"cuoi"});for(let n of(a.push({t:t.cuoi,ten:"ngu"===e.kieuCuoi?"ngay":"tim"}),e.diu))a.push({t:n.t0,ten:"diu"});return a.push({t:t.the,ten:"the"}),a.sort((e,t)=>e.t-t.t)},"c",0,a,"F",0,function(e,t,a,n={},l=Math.random){var h,d;let p,g,f,m,y,q,b,k,v,x,T,w,M,N=[...new Set(e)];if(!N.length)return null;let E=!!n.noi,C=n.nguoiLai??"co",A=e=>e[Math.min(e.length-1,Math.floor(l()*e.length))],V=e=>{let t=[...e];for(let e=t.length-1;e>0;e--){let a=Math.floor(l()*(e+1));[t[e],t[a]]=[t[a],t[e]]}return t},j=N.filter(e=>!t.has(e)),$=Math.max(1,Math.min(5,Math.round(n.soEm??1),N.length)),S=!1;j.length<$&&(S=!0,j=N);let R=V(j).slice(0,$),B=V(N.filter(e=>!R.includes(e))),{cho:G,soCot:L}=(p=Math.max(1,Math.ceil(N.length/3)),g={},N.forEach((e,t)=>{g[e]={hang:t%3,cot:Math.floor(t/3)}}),{cho:g,soCot:p}),_=(h=B.length,d=R.length,v=(k=(b=(q=(y=(m=(f=E?.4:i.gioDau)+i.gioBao)+(E?i.baoNoi:i.baoDau))+i.songVo)+i.voTanh)+i.tanhCap)+i.capLen,x=Math.max(0,h-2),M=(w=(T=v+Math.min(E?i.lenToiDaNoi:i.lenToiDa,x*i.lenMoiEm))+(h>=2?E?i.baNoi:i.ba:1.4*(1===h)))+(d-1)*i.diuThem+(E?i.cuoiNoi:i.cuoi)+.8,{gio:f,bao:m,song:y,songVo:q,tanh:b,cap:k,len:v,ba:T,cuoi:w,the:M}),F=e=>a[e]??"nam1",D=[],O=B.slice(0,Math.max(0,B.length-2)),P=_.ba-_.len;O.forEach((e,t)=>{let a=O.length<=1?0:t/(O.length-1),n=_.len+.92*Math.pow(a,1.25)*P+.08*l();D.push({ten:e,t:n,chao:!1})});let H=Math.min(4,Math.ceil(O.length/6));for(let e=0;e<H;e++)D[Math.floor((e+.5)/H*O.length)].chao=!0;if(B.length>=2){let e=B[B.length-2],t=B[B.length-1],a=E?.8:1;D.push({ten:e,t:_.ba+.2,chao:!1,quen:{tVe:_.ba+1.3*a,tLai:_.ba+2.2*a}}),D.push({ten:t,t:_.ba+2.75*a,chao:!1})}else 1===B.length&&D.push({ten:B[0],t:_.ba+.2,chao:!0});let I=R.map((e,t)=>{let a=t===R.length-1,n=_.cuoi+(a?t*i.diuThem+(E?i.cuoiNoi:i.cuoi)-i.diu-.2:1.5+t*i.diuThem);return{ten:e,t0:n,t1:n+(a?i.diu:i.diuThem-.5)}}),K=V(B),U=new Set,W=[];for(let e of K){if(W.length>=(E?2:4))break;U.has(F(e))||(U.add(F(e)),W.push(e))}let z=W.map((e,t)=>{let a=_.bao+.6+t*((_.song-_.bao-1.5)/Math.max(1,W.length));return{ten:e,t0:a,t1:Math.min(_.song-.2,a+3.4)}}),Q=[...B].sort((e,t)=>G[e].cot-G[t].cot||G[t].hang-G[e].hang),X=Q.find(e=>!W.includes(e))??Q[0]??null,Y=n.tinhTiet??A(r),J=_.bao+(E?2.2:5.2),Z=R[R.length-1],ee=n.kieuCuoi??A(["ngu","so","me"]),et=E?[_.bao+1.2]:[_.bao+2.4,_.bao+8.4];"set"===Y&&et.push(J);let ea=[],en=(e,t,a,n=2.2)=>ea.push({ai:e,chu:u(t,C),t0:a,t1:a+n});for(let e of(E?(en("gv","Lại giông rồi, bám chắc nhé!",_.gio+.3,2.2),X&&en(X,"Em chụp được nón rồi!",_.gio+1.7,1.6)):(en("gv","Các em ngồi yên, bám chắc mạn đò nhé!",.4,2.4),en("lop","Dạ!",2,1.4),B[0]&&en(B[0],"Sông đẹp quá {gv} ơi!",4.6,2.2),en("gv","Ối, nón của {gv}!",_.gio+.3,1.8),X&&en(X,"Em chụp được rồi!",_.gio+1.7,1.8),en("gv","Không thò tay xuống nước nghe chưa!",_.bao+1,2.4),en("gv","Bám chắc vào, sắp qua rồi!",_.bao+7.2,2.2)),z))en(e.ten,o[F(e.ten)],e.t0+.4,2.2);en("gv","Có {gv} đây rồi!",_.songVo+.3,1.8),X&&en(X,"{Gv} ơi, nón của {gv} nè!",_.tanh+.2,1.8);let er=B.find(e=>e!==X)??null;er&&en(er,"{Gv} ơi, {gv} ướt hết rồi kìa!",_.tanh+(E?.3:1.2),2),en("gv","Các em khô là {gv} vui rồi.",_.tanh+(E?1.6:2.4),2),en("gv","Tới bờ rồi, lên từ từ thôi các em!",_.cap+.2,2.2),D.filter(e=>e.chao).forEach((e,t)=>en(e.ten,c[t%c.length],e.t+i.nhay+.9,1.8));let ei=D.find(e=>e.quen);ei?.quen&&(en(ei.ten,"Ơ, quên cặp!",ei.quen.tVe-.5,1.4),en("gv","Từ từ thôi con!",ei.quen.tVe+.3,1.4));let eo=B.length>=2?B[B.length-1]:null;if(eo&&en(eo,"Tới lượt em!",(D.find(e=>e.ten===eo)?.t??_.ba)-.4,1.2),"ca"===Y){let e=[...B].sort((e,t)=>G[t].cot-G[e].cot)[0];e&&en(e,"Cá chép hoá rồng kìa!",J+.6,1.8)}for(let e of I.slice(0,-1))en(e.ten,"Em cảm ơn {gv}!",e.t1-.3,1.3);let es=I[I.length-1],ec="ngu"===ee?"Dạ… em dậy rồi!":"so"===ee?"Dạ… em nắm tay {gv}!":s[F(Z)];en("gv","ngu"===ee?"Tới bờ rồi con ơi!":"so"===ee?"Đừng sợ, có {gv} đây!":"Thôi nào, cất đi rồi lên bờ con!",es.t0-2,1.9),en(Z,ec,es.t0-.9,1.6),en(Z,"Em cảm ơn {gv}!",es.t1+.1,2);let eu=[],el=(e,t,a,n=1.4,r=!1)=>eu.push({id:e,chu:t,t0:a,dai:n,lon:r});return el("gio","GIÓ TO!",_.gio+.1,1.4,!0),et.forEach((e,t)=>el(`set${t}`,"ĐÙNG!",e,1)),el("song","SÓNG LỚN!",_.song+.1,1.5,!0),el("vo","ẦM!",_.songVo,1,!0),"xoay"===Y&&el("xoay","XOÁY NƯỚC!",J,1.5),"lucBinh"===Y&&el("lucBinh","VƯỚNG LỤC BÌNH!",J,1.5),"ca"===Y&&el("ca","CÁ CHÉP VƯỢT SÓNG!",J+.3,1.6),el("cap","CẬP BẾN!",_.cap+1,1.4),{noi:E,nguoiLai:C,chon:R,ds:N,cho:G,soCot:L,nhanVat:a,M:_,lenBo:D,diu:I,hai:z,omNon:X,tinhTiet:Y,tTinhTiet:J,kieuCuoi:ee,set:et,thoai:ea.sort((e,t)=>e.t0-t.t0),chu:eu,lamLai:S}},"B",0,function(e,a){let{M:n}=e,r=.4*!!e.noi,i=a=>a<.8*!e.noi?.25:a<n.gio?1:a<n.tanh?1-.55*t(l(e,a)):a<n.cap-1.4?1.1:1.1*t((n.cap-a)/1.4,.05,1),o=e=>{let t=0,a=Math.max(1,Math.ceil(e/.05)),n=e/a;for(let e=0;e<a;e++)t+=i((e+.5)*n)*n;return t},s=o(n.cap);return a>=n.cap?1:r+(1-r)*t(o(Math.max(0,a))/s)},"L",0,u]);
  return exports;
})();


  // 3. Audio Synthesizer
  let soundSettings = {
    isEnabled: () => true,
    setEnabled: (val) => {}
  };
  
const ferryAudio = (function() {
  let g="/games/ferry/am",f={em:`${g}/nhac-em.mp3`,bao:`${g}/nhac-bao.mp3`,am:`${g}/nhac-am.mp3`},m={cheo:`${g}/nen-cheo.mp3`,cheoGap:`${g}/nen-cheo-gap.mp3`,nuoc:`${g}/nen-nuoc.mp3`,mua:`${g}/nen-mua.mp3`,gio:`${g}/nen-gio.mp3`,chim:`${g}/nen-chim.mp3`,tre:`${g}/nen-tre.mp3`},y={cheo:.9,cheoGap:1,nuoc:.7,mua:1.1,gio:1,chim:.6,tre:.5},q={em:.42,bao:.36,am:.5},b={songVo:`${g}/song-vo.mp3`,te:`${g}/te.mp3`,te2:`${g}/te2.mp3`,sam:`${g}/sam.mp3`,samNho:`${g}/sam-nho.mp3`,go:`${g}/go.mp3`,buoc:`${g}/buoc.mp3`,day:`${g}/day.mp3`,tim:`${g}/tim.mp3`,laSong:`${g}/la-song.mp3`,laVo:`${g}/la-vo.mp3`,reo:`${g}/reo.mp3`,reo2:`${g}/reo2.mp3`,cuoi:`${g}/cuoi.mp3`,ngay:`${g}/ngay.mp3`,vut:`${g}/vut.mp3`,xoay:`${g}/xoay.mp3`,tom:`${g}/tom.mp3`,nhay:`${g}/nhay.mp3`,chuong:`${g}/chuong.mp3`,coc:`${g}/coc.mp3`},k=new Set(Object.values(f));
let audioInstance = new class{ctx=null;tong=null;bo=new Map;dangNap=null;lop=new Map;chay=!1;lanBuoc=0;getCtx(){try{if(!this.ctx){let e=window.AudioContext||window.webkitAudioContext;if(!e)return null;this.ctx=new e;let t=this.ctx.createGain(),a=this.ctx.createDynamicsCompressor();a.threshold.value=-10,a.ratio.value=4,a.attack.value=.005,a.release.value=.2,t.connect(a),a.connect(this.ctx.destination),this.tong=t}return"suspended"===this.ctx.state&&this.ctx.resume().catch(()=>{}),this.ctx}catch{return null}}napTruoc(){if(this.dangNap)return this.dangNap;let e=this.getCtx();if(!e)return Promise.resolve();for(let e of Object.values(f))this.theNhac(e);let t=[...Object.values(m),...Object.values(b)];return this.dangNap=Promise.all(t.map(async t=>{try{let a=await (await fetch(t)).arrayBuffer();this.bo.set(t,await e.decodeAudioData(a))}catch{}})).then(()=>{}),this.dangNap}nhacThe=new Map;theNhac(e){if("u"<typeof Audio)return null;let t=this.nhacThe.get(e);return t||((t=new Audio(e)).loop=!0,t.preload="auto",this.nhacThe.set(e,t)),t}layLop(e){let t=this.getCtx();if(!t||!this.tong)return null;let a=this.lop.get(e);if(!a){let n=t.createGain();if(n.gain.value=0,n.connect(this.tong),a={src:null,g:n,url:e,muc:0,imTu:0},k.has(e)){let r=this.theNhac(e);if(r)try{t.createMediaElementSource(r).connect(n),a.the=r}catch{}}this.lop.set(e,a)}if(a.the)return a.the.paused&&a.the.play().catch(()=>{}),a;if(!a.src&&this.bo.has(e)){let n=t.createBufferSource();n.buffer=this.bo.get(e),n.loop=!0,n.connect(a.g),n.start(0,Math.random()*Math.max(0,n.buffer.duration-1)),a.src=n}return a}datMuc(e,t,a=.6){let n=this.ctx;t=Math.max(0,t);let r=this.lop.get(e);t>.001&&(!r||!r.src&&!r.the||r.the?.paused)&&(r=this.layLop(e)??void 0),n&&r&&(Math.abs(t-r.muc)>.004?(r.muc>.001&&t<=.001&&(r.imTu=n.currentTime),r.muc=t,r.g.gain.cancelScheduledValues(n.currentTime),r.g.gain.setTargetAtTime(t,n.currentTime,a/3)):t<=.001&&n.currentTime-r.imTu>3&&this.dungLop(r))}dungLop(e){if(e.the){e.the.paused||e.the.pause();return}if(e.src){try{e.src.stop()}catch{}e.src.disconnect(),e.src=null}}capNhat(e,t){if(this.chay&&soundSettings.isEnabled()){for(let t of Object.keys(f))this.datMuc(f[t],e===t?q[t]:0,1.6);for(let e of Object.keys(m))this.datMuc(m[e],t?t[e]*y[e]:0,"mua"===e||"gio"===e?1.2:.5)}}batNen(){this.chay=!0,this.getCtx()}tatNen(){this.chay=!1;let e=this.ctx;if(e){for(let t of this.lop.values())t.muc>.001&&(t.imTu=e.currentTime),t.muc=0,t.g.gain.cancelScheduledValues(e.currentTime),t.g.gain.setTargetAtTime(0,e.currentTime,.08);window.setTimeout(()=>{if(!this.chay)for(let e of this.lop.values())this.dungLop(e)},500)}}tep(e,t=1,a=0){let n=this.getCtx(),r=this.bo.get(e);if(!n||!r||!this.tong||!soundSettings.isEnabled())return;let i=n.createBufferSource();i.buffer=r;let o=n.createGain();o.gain.value=t,i.connect(o),o.connect(this.tong),i.start(n.currentTime+a)}tone(e,t,a,n=0,r="triangle"){let i=this.getCtx();if(!i||!this.tong||!soundSettings.isEnabled())return;let o=i.currentTime+n,s=i.createOscillator(),u=i.createGain();s.type=r,s.frequency.value=e,u.gain.setValueAtTime(1e-4,o),u.gain.exponentialRampToValueAtTime(a,o+.01),u.gain.exponentialRampToValueAtTime(1e-4,o+t),s.connect(u),u.connect(this.tong),s.start(o),s.stop(o+t+.02)}dan(){[392,440,523.25,587.33,659.25,783.99].forEach((e,t)=>{this.tone(e,1.4,.16,.13*t),this.tone(2*e,.6,.05,.13*t,"sine")})}loTen(){[523.25,659.25,783.99,1046.5].forEach((e,t)=>{let a=3===t?.6:.14;this.tone(e,a,.22,.12*t),this.tone(e/2,a,.1,.12*t,"square")})}buoc(){let e=performance.now();e-this.lanBuoc<90||(this.lanBuoc=e,this.tep(b.nhay,.55+.3*Math.random()),this.tep(b.buoc,.4+.3*Math.random(),.12))}phat(e){switch(e){case"roi":this.tep(b.day,.8),this.tep(b.go,.6,.4);break;case"dap":this.tep(b.tom,.35);break;case"gio":this.tep(b.samNho,.5),this.tep(b.vut,.5,.15);break;case"non":this.tep(b.vut,.9);break;case"bao":this.tep(b.te,.6);break;case"set":this.tep(b.sam,1);break;case"song":this.tep(b.te2,.7),this.tep(b.laSong,.42,.25);break;case"vo":this.tep(b.songVo,1),this.tep(b.te,1,.15),this.tep(b.laVo,.38,.05);break;case"tanh":this.tep(b.chuong,.7),this.tep(b.reo2,.4,.7);break;case"cap":this.tep(b.go,1),this.tep(b.day,.9,.5),this.tep(b.reo,.45,.35);break;case"cuoi":this.tep(b.cuoi,.38);break;case"ngay":this.tep(b.ngay,.85);break;case"buoc":this.buoc();break;case"quen":this.tep(b.go,.5);break;case"tim":this.tep(b.tim,1),this.tep(b.tim,.7,.25),this.tep(b.tim,1,.9),this.tep(b.tim,.7,1.15);break;case"diu":this.dan();break;case"the":this.loTen();break;case"ca":this.tep(b.tom,.9),this.tep(b.tom,.7,1.1);break;case"lucBinh":this.tep(b.coc,1),this.tep(b.tom,.55,.05),this.tep(b.coc,.6,.5);break;case"xoay":this.tep(b.xoay,1),this.tep(b.te2,.35,.3)}}}
  return audioInstance;
})();

  soundSettings.isEnabled = () => !ferryAudio.cam;
  soundSettings.setEnabled = (val) => ferryAudio.datCam(!val);

  // 4. Asset Loader
  let FERRY_ASSET_BASE = "/games/ferry";
  
async function p(e, t, a) {
  let fullBase = FERRY_ASSET_BASE;
  let jsonUrl = fullBase + (fullBase.endsWith('/') ? '' : '/') + 'bo-anh.json?t=' + Date.now();
  let n = await fetch(jsonUrl, { cache: "no-store" });
  let r = await n.json();
  let i = { caoHs: r.caoHs, caoNgoi: r.caoNgoi, caoGv: r.caoGv, hs: {}, gv: {}, fx: {}, nen: {} };
  let o = [], s = 0;
  let c = (e, t) => {
    let itemUrl = fullBase + (fullBase.endsWith('/') ? '' : '/') + e + (e.includes('?') ? '' : '?v=2');
    o.push(new Promise(t => {
      let a = new Image();
      a.decoding = "async";
      a.onload = () => t(a);
      a.onerror = () => { console.warn("Failed loading:", itemUrl); t(void 0); };
      a.src = itemUrl;
    }).then(async e => {
      if (e) {
        try {
          if ("function" == typeof createImageBitmap) return await createImageBitmap(e);
          await e.decode();
        } catch {}
        return e;
      }
    }).then(e => {
      e && t(e);
      a?.(++s / Math.max(1, o.length));
    }));
  };
  let u = (e, t) => c(e.tep, a => t({ anh: a, so: e.so, w: e.w, h: e.h, le: e.le, mui: e.mui }));

  for (let ch of new Set(e)) {
    for (let [k, a] of Object.entries(r.hs[ch] ?? {})) {
      u(a, a => { (i.hs[ch] ??= {})[k] = a; });
    }
  }

  // Preload BOTH thay and co
  for (let gvKey of ["thay", "co"]) {
    for (let [k, a] of Object.entries(r.gv[gvKey] ?? {})) {
      let n = () => (i.gv[gvKey] ??= {})[k];
      u({ ...a, cheo: void 0 }, r => {
        let o = n();
        (i.gv[gvKey] ??= {})[k] = { ...r, cheo: a.cheo, tay: o?.tay };
      });
      a.tay && c(a.tay, a => {
        let r = n();
        r ? r.tay = a : (i.gv[gvKey] ??= {})[k] = { tay: a };
      });
    }
  }

  for (let [k, t] of Object.entries(r.fx ?? {})) u(t, t => { i.fx[k] = t; });
  for (let [k, t] of Object.entries(r.nen ?? {})) c(t.tep, t => { i.nen[k] = t; });
  if (r.do) c(r.do.tep, e => { i.do = e; });

  await Promise.all(o);
  return i;
}


  // 5. Visual Shoreline Curves & Helpers
  var e = FerryLogic;
  var i = {
    r: getShortNames,
    K: function(shortMap, studentId) {
      if (shortMap && shortMap[studentId]) return shortMap[studentId];
      var res = getShortNames([studentId]);
      return res[studentId] || studentId;
    }
  };
  let a=[[0,150],[100,155],[200,165],[300,175],[400,186],[500,195],[600,200],[700,203],[800,203],[900,200],[1e3,195],[1100,185],[1200,170],[1300,150],[1400,120],[1460,95],[1500,90]],o=[{dy:-40,k:.86,lech:0},{dy:-8,k:.93,lech:.5},{dy:40,k:1,lech:.25}],h={dau:[40,-190],huong:[-.72,.69],day:19},n={nam1:1.3,nam2:.98,nam3:.72,nam4:1.12,nam5:1.08,nam6:1,nu1:1.2,nu2:.92,nu3:.7,nu4:1,nu5:1.02,nu6:.98},l=(t,e)=>e?1+(n[t]-1)*.65:n[t],r=5940,s=7330,u=.47,c=280,g=6640,f=[.02,.104,.21,.317,.42,.511,.614,.727],d=f.map(t=>5900+1889*t),M=t=>[parseInt(t.slice(1,3),16),parseInt(t.slice(3,5),16),parseInt(t.slice(5,7),16)],b=(t,e,i)=>[t[0]+(e[0]-t[0])*i,t[1]+(e[1]-t[1])*i,t[2]+(e[2]-t[2])*i],y=(t,e=1)=>`rgba(${0|t[0]}, ${0|t[1]}, ${0|t[2]}, ${e})`,x={em:["#5aa9e6","#a9d8f2","#fff0cc"].map(M),bao:["#1f2a33","#3d4b56","#6f7d86"].map(M),am:["#5d9fe0","#ffcf8f","#fff1d6"].map(M)},v={em:["#a7dbe6","#4fa3b4","#25707f"].map(M),bao:["#5b6b72","#33464f","#1b2c33"].map(M),am:["#f3d9a6","#5fa9b0","#2a7480"].map(M)},m=t=>{let e=43758.5453*Math.sin(127.1*t+311.7);return e-Math.floor(e)};function T(t){if(t<=a[0][0])return a[0][1];for(let e=1;e<a.length;e++)if(t<=a[e][0]){let i=(t-a[e-1][0])/(a[e][0]-a[e-1][0]);return a[e-1][1]+(a[e][1]-a[e-1][1])*i}return a[a.length-1][1]}

  // 6. Scene Engine (CanhChuyenDo)
  class CanhChuyenDo {cv;bo;sanh;onMoc;ctx;c;t;tSanh;dung;dpr;moc;goi;catMan;nguoiLai;constructor(t,e,i){var o;this.cv=t,this.bo=e,this.sanh=i,this.onMoc=()=>{},this.c=null,this.t=0,this.tSanh=0,this.dung=!1,this.dpr=1,this.moc=[],this.muiCheo=null,this.matSong=new Float32Array(0),this.xHatSang=0;let h=t.getContext("2d",{alpha:!1});if(!h)throw Error("Không mở được màn vẽ 2D");this.ctx=h,this.nguoiLai=i.nguoiLai,this.goi={};let n=new Path2D;n.moveTo(-200,-2e3),n.lineTo(1700,-2e3),n.lineTo(1700,T(1500));for(let t=a.length-1;t>=0;t--)n.lineTo(a[t][0],a[t][1]);n.lineTo(-200,T(0)),n.closePath(),this.catMan=n;let l=e.nen["nen-ben-den"];l&&(r=5900+.02*(o=l.width/l.height*900),s=5900+.755*o,u=(.431-.287)*900/(c=.145*o),g=5900+.39*o,d=f.map(t=>5900+t*o)),this.lamNong()}static async tao(e,i,a,o){let h=new CanhChuyenDo(e,i,a);return h.goi=o,h}lamNong(){let t=[this.bo.do,...Object.values(this.bo.nen)];for(let e of Object.values(this.bo.hs))for(let i of Object.values(e??{}))t.push(i?.anh);for(let e of Object.values(this.bo.gv))for(let i of Object.values(e??{}))t.push(i?.anh);for(let e of Object.values(this.bo.fx))t.push(e?.anh);for(let e of t)e&&this.ctx.drawImage(e,0,0,1,1)}doiGiaoVien(gender){ this.nguoiLai = gender; if (this.sanh) this.sanh.nguoiLai = gender; if (this.c) this.c.nguoiLai = gender; }
doiCo(t,e,i){this.dpr=i,this.cv.width=Math.round(t*i),this.cv.height=Math.round(e*i)}datTamDung(t){this.dung=t}datThoiGian(t){this.t=t}get thoiGian(){return this.t}huy(){this.c=null}batDauChuyen(t){this.c=t,this.t=0,this.dung=!1,this.nguoiLai=t.nguoiLai,this.moc=(0,e.b)(t)}tua(){this.c&&(this.t=Math.max(this.t,this.c.M.the+.01),this.moc=this.moc.filter(t=>"the"===t.ten&&t.t>this.t),this.onMoc("the"))}khungHinh(t,e,i){if(!this.dung)if(this.c){let e=this.t;for(let i of(this.t+=t,this.moc))i.t>e&&i.t<=this.t&&this.onMoc(i.ten)}else this.tSanh+=t;let a=this.c??this.sanh,o=this.c?this.t:-1;return this.ve(a,o,this.c?this.t:this.tSanh,e,i)}ve(t,a,o,h,n){let l=this.ctx,r=this.cv.width,s=this.cv.height,u=a<0,c=u?0:(0,e.u)(t,a),g=u?0:(0,e.c)((a-t.M.tanh)/2.2),f=u?0:(0,e.B)(t,a),d=this.bienDoiDo(t,a,o,c,f),M=this.mayQuay(t,a,d,r/s),b=s/900*M.z,y=0,x=0;if(!u){let e=(t,e,i)=>{let o=(a-t)/e;if(o>0&&o<1){let t=i*(1-o);y+=Math.sin(91*a)*t,x+=Math.cos(77*a)*t}};for(let i of(e(t.M.songVo,.7,16),t.set))e(i,.35,6)}let v=r/2-(M.cx+y)*b,m=s/2-(M.cy+x)*b,T=r/b,p=M.cx-T/2,k=M.cx+T/2;l.setTransform(1,0,0,1,0,0),this.veTroi(r,s,c,g,o),l.setTransform(b,0,0,b,v,m),this.veMayGiong(t,a,o,c,p,T),g>.01&&this.veCauVong(g),this.veCo(t,a,o,p,T),this.veNen(p,k),this.veNuocSau(o,c,g,p,k,d),this.veBenDen(p,k),u||this.veTinhTietSau(t,a,d);let S=[],G={},P=(t,e,a,o,h,n)=>{let l=(e*b+v)/this.dpr,r=(a*b+m)/this.dpr;S.push({id:t,ten:(0,i.K)(this.goi,t),x:l,y:r,coChu:o,chon:h,nguy:n})},C=new Set,N=[];for(let e of(u||this.veTrenBen(t,a,d,C,N,G,P),u||this.veSongLon(t,a,d,!1),this.muiCheo=null,this.veDo(t,a,o,c,d,C,G,P),u||this.veSongLon(t,a,d,!0),this.veNuocTruoc(o,c,g,p,k,d),this.veNuocCheo(o,c),u||(this.veBot(t,a,d),this.veTinhTietTruoc(t,a,d)),N))e();return u||(this.veNon(t,a,d),this.veHatSang(t,a)),l.setTransform(1,0,0,1,0,0),c>.01&&(l.fillStyle=`rgba(14, 24, 36, ${.36*Math.min(1,c)})`,l.fillRect(0,0,r,s)),g>.01&&this.veTiaNang(r,s,g,o),u||(this.veMua(r,s,c,o),this.veGio(r,s,t,a,c,o),this.veSet(t,a,r,s,b,v,m,p,T)),{ten:this.xepTen(S,t.ds.length),chu:u?[]:this.chuHieuUng(t,a,h,n),thoai:u?[]:this.thoai(t,a,G,b,v,m),nhac:u?null:a<t.M.gio?"em":a<t.M.tanh?"bao":"am",nen:u?null:this.mucNen(t,a,c)}}mucNen(t,i,a){let{M:o}=t;return{cheo:+(i<o.gio||i>o.tanh+.8&&i<o.cap),cheoGap:+(i>o.gio+1.6&&i<o.song+.3),nuoc:i<o.cap+1?.8:.45,mua:(0,e.G)(1.1*a),gio:(0,e.G)((a-.1)*1.2),chim:i<o.gio-1||i>o.tanh+1?1-(0,e.G)(2*a):0,tre:+(i>o.cap+.6&&i<o.the+1.5)}}bienDoiDo(t,e,i,a,o){let h=1060+(g-1060)*o,n=t=>this.song(t,i,.92,a),l=1260*.42,r=n(h+1260*.42),s=n(h-l),u=.8*Math.atan2(r-s,2*l)+Math.sin(1.3*i)*(.006+.03*a),c=812+(r+s)/2*.7+Math.sin(2.1*i)*(1.5+3*a);if(e>=0&&"xoay"===t.tinhTiet){let i=(e-t.tTinhTiet)/2.2;if(i>0&&i<1){let t=Math.sin(i*Math.PI);u+=.09*t*Math.sin(9*i),h+=-30*t,c+=6*t}}return e>=0&&e>t.M.cap&&e<t.M.cap+.8&&(u+=.012*Math.sin((e-t.M.cap)*12)*(1-(e-t.M.cap)/.8)),{x:h,y:c,goc:u}}raTheGioi(t,e,i){let a=(e-750)*.84,o=(i-232)*.84,h=Math.cos(t.goc),n=Math.sin(t.goc);return{x:t.x+a*h-o*n,y:t.y+a*n+o*h}}choNgoi(t,e){let i=t.cho[e],a=o[i.hang],h=262+1038/t.soCot*(i.cot+.25+.5*a.lech);return{x:h,y:T(h)+a.dy,k:a.k,hang:i.hang}}veDo(t,i,a,o,n,r,s,u){let c=this.ctx;c.save(),c.translate(n.x,n.y),c.rotate(n.goc),c.scale(.84,.84),c.translate(-750,-232),this.bo.do&&c.drawImage(this.bo.do,0,0,1500,1500*this.bo.do.height/this.bo.do.width),c.save(),c.clip(this.catMan);let g=t.ds.filter(t=>!r.has(t)).map(e=>({ten:e,...this.choNgoi(t,e)})).sort((t,e)=>t.hang-e.hang||t.x-e.x),f=t.ds.length>30?15:t.ds.length>15?16:18;for(let e of g){let h=t.nhanVat[e.ten]??"nam1",{dai:r,khung:c,run:g}=this.dangNgoi(t,e.ten,h,i,a,o,e.x),d=196*e.k*l(h,!0),M=g?1.6*Math.sin(47*a+e.x):0;this.veDai(r,c,e.x+M,e.y,d,this.bo.caoNgoi,!1),i>=0&&e.ten===t.omNon&&i>t.M.gio+1.7&&i<t.M.tanh+.2&&this.veNonTai(e.x+6,e.y-.42*d,52/.84,0);let b=this.raTheGioi(n,e.x,e.y-.93*d);s[e.ten]=b;let y=i>=0&&i>=t.M.cuoi&&t.chon.includes(e.ten),x=i>=0&&i>=t.M.ba&&i<t.M.cuoi;u(e.ten,b.x,b.y-6,f,y,x)}if(c.restore(),i<0||i<t.M.cuoi){let{dai:l,khung:r,lat:u}=this.dangLai(t,i,a),c=i>=0&&"lucBinh"===t.tinhTiet&&i>t.tTinhTiet&&i<t.tTinhTiet+1.4?3*Math.sin(60*a):0,g=l?(Math.floor(r)%l.so+l.so)%l.so:0,f=l?.cheo?.[g];if(l&&!f&&this.veMaiCheo(n,108,122,236/.84/this.bo.caoGv,!1,h,-1,a,o,.04*Math.sin(2.2*a)),this.veDai(l,r,128+c,122,236/.84,this.bo.caoGv,u),l&&f){let e=236/.84/this.bo.caoGv,h=this.dangLai(t,i,a).nhip??-1;this.veMaiCheo(n,128+c,122,e,u,f,h,a,o),l.tay&&this.veLopTay(l,g,128+c,122,236/.84,this.bo.caoGv,u)}i>=0&&this.coNon(t,i)&&!l&&this.veNonTai(128,122-236/.84,70/.84,0),s[e.K]=this.raTheGioi(n,138,122-236/.84-10)}s[e.$]=this.raTheGioi(n,781,T(750)-150),c.restore()}muiCheo;veMaiCheo(t,e,i,a,o,h,n,l,r,s=0){let u=this.ctx,c=o?-1:1,g=Math.atan2(h.huong[1],h.huong[0]*c)+s,f=Math.cos(g),d=Math.sin(g),M=e+h.dau[0]*a*c,b=i+h.dau[1]*a,y=236/.84*2.05,x=Math.max(8,h.day*a*.62),v=Math.atan2(d,f);u.save(),u.translate(M,b),u.rotate(v);let m=.68*y,T=u.createLinearGradient(0,-(2.6*x),0,2.6*x);T.addColorStop(0,"#7a4a22"),T.addColorStop(.45,"#c98a4b"),T.addColorStop(.55,"#b87a3e"),T.addColorStop(1,"#6d4120"),u.fillStyle=T,u.strokeStyle="#2b1a0e",u.lineWidth=Math.max(2,.32*x),u.lineJoin="round",u.beginPath(),u.moveTo(-(.2*x),-x/2),u.lineTo(m,-x/2),u.quadraticCurveTo(m+.05*y,-(2.6*x),m+.12*y,-(2.6*x)),u.lineTo(y-2.2*x,-(2.6*x)),u.quadraticCurveTo(y,-(2.6*x),y,0),u.quadraticCurveTo(y,2.6*x,y-2.2*x,2.6*x),u.lineTo(m+.12*y,2.6*x),u.quadraticCurveTo(m+.05*y,2.6*x,m,x/2),u.lineTo(-(.2*x),x/2),u.quadraticCurveTo(-(.7*x),0,-(.2*x),-x/2),u.closePath(),u.fill(),u.stroke(),u.strokeStyle="rgba(60, 35, 15, 0.55)",u.lineWidth=Math.max(1.5,.18*x),u.beginPath(),u.moveTo(m+.04*y,0),u.lineTo(y-1.5*x,0),u.stroke(),u.restore();let p=0,k=y,S=null,G=e=>this.raTheGioi(t,M+f*e,b+d*e),P=t=>{let e=G(t);return e.y-this.matNuocGan(e.x,l,r)};if(P(y)>0){for(let t=0;t<18;t++){let t=(p+k)/2;P(t)>0?k=t:p=t}S=G(k)}this.muiCheo=S?{...S,nhip:n}:null}veLopTay(t,e,i,a,o,h,n){if(!t.tay)return;let l=o/h,r=t.w*l,s=t.h*l,u=this.ctx;u.save(),u.translate(i,a+t.le*l),n&&u.scale(-1,1),u.drawImage(t.tay,e*t.w,0,t.w,t.h,-r/2,-s,r,s),u.restore()}matNuocGan(t,e,i){return 796.9459917787946+this.song(t,e,.69,i)}veNuocCheo(t,i){let a=this.muiCheo;if(!a)return;let o=this.ctx,h=a.x,n=a.y,l=a.nhip>=0?Math.sin(Math.PI*(0,e.G)((a.nhip-.35)/.4)):0;o.save();for(let e=0;e<3;e++){let i=(1.4*t+e/3)%1;o.globalAlpha=(1-i)*(.55+.35*l),o.strokeStyle="rgba(255, 255, 255, 0.9)",o.lineWidth=2.5-1.5*i,o.beginPath(),o.ellipse(h,n+2,14+70*i,3+9*i,0,0,2*Math.PI),o.stroke()}if(o.globalAlpha=.85,o.fillStyle="rgba(255, 255, 255, 0.9)",o.beginPath(),o.ellipse(h-4-8*l,n,16+14*l,5+3*l,0,0,2*Math.PI),o.fill(),a.nhip>=0){let l=(0,e.G)((a.nhip-.4)/.5);if(l>0&&l<1){let e=Math.floor(2*t);for(let t=0;t<14;t++){let a=-(90+220*m(31*e+t))*(1+.6*i),r=-(160+220*m(17*e+t)),s=a*l*.55,u=r*l*.55+.55*l*600*(.55*l);o.globalAlpha=(1-l)*.9,o.beginPath(),o.arc(h+s,n+u,2+3.5*m(t+e),0,2*Math.PI),o.fill()}}}o.strokeStyle="rgba(235, 250, 255, 0.7)",o.lineWidth=2;for(let e=0;e<3;e++){let a=(.9*t+e/3)%1;o.globalAlpha=(1-a)*.7;let n=h-30-160*a,l=this.matNuocGan(n,t,i)+3;o.beginPath(),o.ellipse(n,l,10+12*a,3+2*a,0,6*a,6*a+1.4*Math.PI),o.stroke()}o.restore()}dangNgoi(t,e,i,a,o,h,n){let l=this.bo.hs[i]??{},r=(...t)=>{for(let e of t)if(l[e])return l[e]},s=4*m(7*e.length+n),u=()=>({dai:r("ngoi"),khung:Math.floor(2.2*o+s)%4,run:!1});if(a<0)return u();let{M:c}=t;if(e===t.chon[t.chon.length-1]&&a>=c.cap+.6){let e=t.diu[t.diu.length-1];return"ngu"===t.kieuCuoi?a<e.t0-1?{dai:r("cuoi","ngoi"),khung:Math.floor(.9*o)%2,run:!1}:a<e.t0-.3?{dai:r("cuoi","ngoi"),khung:2,run:!0}:{dai:r("cuoi","ngoi"),khung:3,run:!1}:"so"===t.kieuCuoi?{dai:r("cuoi","gio"),khung:3,run:!0}:{dai:r("hai","ngoi"),khung:Math.floor(5*o)%4,run:!1}}if(a>=c.tanh&&a<c.cap+.6)return{dai:r("mung","ngoi"),khung:Math.floor(6*o+s)%4,run:!1};let g=t.hai.find(t=>t.ten===e&&a>=t.t0&&a<t.t1);if(g)return{dai:r("hai","gio","ngoi"),khung:Math.floor((a-g.t0)*5)%4,run:!1};if(h>.3&&a<c.tanh){let i=n/1500*.35,l=t.set.some(t=>a>t&&a<t+.9),u=a>c.song+.6+i&&a<c.songVo+.8+i||l||"xoay"===t.tinhTiet&&a>t.tTinhTiet&&a<t.tTinhTiet+1.6,g=t.cho[e]&&t.ds.filter(i=>t.cho[i].hang===t.cho[e].hang).every(i=>t.cho[i].cot<=t.cho[e].cot);return u||g?{dai:r("gio","ngoi"),khung:2+Math.floor(o*(u?6:2.5))%2,run:!0}:{dai:r("gio","ngoi"),khung:Math.floor(3*o+s)%2,run:h>.8}}return u()}coNon(t,e){return e<t.M.gio+.2||e>=t.M.tanh+.8}dangLai(t,e,i){let a=this.bo.gv[this.nguoiLai]??{},o=(...t)=>{for(let e of t)if(a[e])return a[e]};if(e<0)return{dai:o("cheo"),khung:0,lat:!1};let{M:h}=t;if(e<1.2&&!t.noi)return{dai:o("cheo"),khung:Math.floor(3*e)%8,lat:!1,nhip:3*e/8%1};if(e<h.gio+.2)return{dai:o("cheo"),khung:Math.floor(7*e)%8,lat:!1,nhip:7*e/8%1};if(e<h.gio+1.6)return{dai:o("matnon","cheobao","cheo"),khung:Math.min(3,Math.floor((e-h.gio-.2)/1.4*4)),lat:!1};if(e<h.song+.3)return"lucBinh"===t.tinhTiet&&e>t.tTinhTiet&&e<t.tTinhTiet+1.4?{dai:o("cheobao","cheo"),khung:2+Math.floor(8*i)%2,lat:!1}:{dai:o("cheobao","cheo"),khung:Math.floor(9*e)%8,lat:!1,nhip:9*e/8%1};if(e<h.tanh+.8){let t=e-(h.song+.3)<.5?0:e<h.songVo?1:e<h.tanh-.5?2:3;return{dai:o("chan","cheobao","cheo"),khung:t,lat:!1}}return e<h.cap?{dai:o("cheo"),khung:Math.floor(7*e)%8,lat:!1,nhip:7*e/8%1}:{dai:o("cheo"),khung:0,lat:!1}}veTrenBen(t,i,a,o,h,n,r){let g=t.ds.length>30?15:t.ds.length>15?16:18,f=e=>{let i=this.choNgoi(t,e);return{...this.raTheGioi(a,i.x,i.y),k:i.k}},d=[],M=(t,e,i,a,o,h,s,u)=>{let c=150*l(e,!1)*s,f=this.bo.hs[e]?.[o]??this.bo.hs[e]?.di??this.bo.hs[e]?.ngoi;d.push({y:a,ve:()=>this.veDai(f,h,i,a,c,this.bo.caoHs,!1)}),n[t]={x:i,y:a-c-8},r(t,i,a-c-14,g,u,!1)};for(let e of t.lenBo){if(i<e.t)continue;let a=this.viTriLenBo(t,e,i,f);if(!a||a.trongDo||(o.add(e.ten),a.an))continue;let r=t.nhanVat[e.ten]??"nam1";if(a.bay){let t=150*l(r,!1)*a.k,i=this.bo.hs[r]?.di??this.bo.hs[r]?.ngoi;h.push(()=>this.veDai(i,3,a.x,a.y,t,this.bo.caoHs,a.lat)),n[e.ten]={x:a.x,y:a.y-t};continue}M(e.ten,r,a.x,a.y,a.dai,a.khung,a.k,!1)}if(i>=t.M.cuoi){let b=this.viTriGvBen(t,i,a),y=this.bo.gv[this.nguoiLai]??{},x=y[b.dai]??y.di??y.cheo;for(let y of(b.bay?h.push(()=>this.veDai(x,b.khung,b.x,b.y,236,this.bo.caoGv,b.lat)):d.push({y:b.y+.1,ve:()=>this.veDai(x,b.khung,b.x,b.y,236,this.bo.caoGv,b.lat)}),n[e.K]={x:b.x,y:b.y-236-6},t.diu)){if(i<y.t0)continue;o.add(y.ten);let d=t.nhanVat[y.ten]??"nam1",b=f(y.ten),x=this.xDiu(t,y.ten,a)-62;if(i<y.t1){let t=(i-y.t0)/(y.t1-y.t0),a=b.x+(x-b.x)*(0,e.c)(1.4*t),o=b.y+(686-b.y)*(0,e.c)(t)-30*Math.sin(Math.PI*(0,e.G)(t)),s=b.k+(1-b.k)*t;h.push(()=>this.veDai(this.bo.hs[d]?.diu??this.bo.hs[d]?.di,Math.min(3,Math.floor(4*t)),a,o,150*l(d,!1)*s,this.bo.caoHs,!1)),n[y.ten]={x:a,y:o-150},r(y.ten,a,o-150*l(d,!1)-14,g+4,!0,!1);continue}if(y===t.diu[t.diu.length-1]){M(y.ten,d,x,686,"diu",3,1,!0);continue}let v=i-y.t1-.3;if(v<0)M(y.ten,d,x,686,"diu",3,1,!0);else{let t=x+120*v,e=Math.max(0,t-s);e<c&&M(y.ten,d,t,686-e*u,"di",Math.floor(9*v)%8,1-e/c*.25,!0)}}}d.sort((t,e)=>t.y-e.y).forEach(t=>t.ve())}viTriLenBo(t,i,a,o){let h=e.E.nhay,n=100+40*m(13*i.ten.length+i.t),l=o(i.ten),r=l.x+14,g=t=>{let i=(0,e.G)((a-t)/h);return{bay:!0,x:l.x+(r-l.x)*i,y:l.y+(686-l.y)*i-70*Math.sin(Math.PI*i),k:l.k+(1-l.k)*i,lat:!1,dai:"di",khung:3}},f=(t,e,i=0)=>{let a=t+e*n,o=Math.max(0,a-s);return o>c?{an:!0,x:a,y:686,k:1,lat:!1,dai:"di",khung:0}:{x:a,y:686-o*u,k:1-o/c*.25,lat:!1,dai:"di",khung:(Math.floor(9*e)+i)%8}};if(i.quen){let t=i.quen;if(a<i.t+h)return g(i.t);let e=t.tVe-.6;if(a<e)return f(r,a-i.t-h);let o=r+(e-i.t-h)*n;if(a<t.tVe)return{x:o,y:686,k:1,lat:!0,dai:"di",khung:0};if(a<t.tVe+h){let e=(a-t.tVe)/h;return{bay:!0,x:o+(l.x-o)*e,y:686+(l.y-686)*e-70*Math.sin(Math.PI*e),k:1-(1-l.k)*e,lat:!0,dai:"di",khung:3}}return a<t.tLai?{trongDo:!0,x:l.x,y:l.y,k:l.k,lat:!1,dai:"ngoi",khung:0}:a<t.tLai+h?g(t.tLai):f(r,a-t.tLai-h)}if(a<i.t+h)return g(i.t);let d=a-i.t-h;if(i.chao){if(d<.6)return f(r,d);let t=r+.6*n;if(d<2.8){let e=d-.6;return{x:t,y:686,k:1,lat:!1,dai:"chao",khung:e<1.1?Math.min(1,Math.floor(2*e)):2+Math.floor(4*e)%2}}return f(t,d-2.8)}return f(r,d)}xDiu(t,e,i){let a=this.choNgoi(t,e);return function(t,e,i){let a=t=>d.some(e=>52>Math.abs(t-e))||d.some(e=>40>Math.abs(t-62-e));for(let o=0;o<=160;o+=6)for(let h of[t+o,t-o])if(h>=e&&h<=i&&!a(h))return h;return t}(Math.min(s-20,Math.max(r+40,this.raTheGioi(i,a.x,a.y).x+62)),r+40,s-20)}viTriGvBen(t,i,a){let o=this.raTheGioi(a,128,122),h=Math.max(r+20,o.x+40),n=t.M.cuoi;if(i<n+e.E.nhay){let t=(0,e.G)((i-n)/e.E.nhay);return{bay:!0,x:o.x+(h-o.x)*t,y:o.y+(686-o.y)*t-60*Math.sin(Math.PI*t),dai:"di",khung:3,lat:!1}}let l=h,s=n+e.E.nhay;for(let o of t.diu){let h=this.xDiu(t,o.ten,a);if(i<o.t0){let t=Math.max(.01,o.t0-s),a=(0,e.G)((i-s)/Math.min(t,Math.abs(h-l)/230+.05)),n=l+(h-l)*a;if(a>=1)return{x:h,y:686,dai:"diu",khung:0,lat:!1};return{x:n,y:686,dai:"di",khung:Math.floor((i-s)*10)%8,lat:h<l}}if(i<o.t1)return{x:h,y:686,dai:"diu",khung:Math.min(3,Math.floor((i-o.t0)/(o.t1-o.t0)*4)),lat:!1};l=h,s=o.t1}return{x:l,y:686,dai:"diu",khung:3,lat:!1}}veDai(t,e,i,a,o,h,n,l=1){if(!t)return;let r=(Math.floor(e)%t.so+t.so)%t.so,s=o/h,u=t.w*s,c=t.h*s,g=this.ctx;g.save(),g.translate(i,a+t.le*s),n&&g.scale(-1,1),l<1&&(g.globalAlpha=l),g.drawImage(t.anh,r*t.w,0,t.w,t.h,-u/2,-c,u,c),g.restore()}veNonTai(t,e,i,a,o=0){let h=this.bo.fx.non;if(!h)return;let n=this.ctx,l=i*h.h/h.w;n.save(),n.translate(t,e),n.rotate(o),n.drawImage(h.anh,a%h.so*h.w,0,h.w,h.h,-i/2,-l/2,i,l),n.restore()}veNon(t,e,i){if(!t.omNon)return;let a=this.raTheGioi(i,128,122-236/.84*.96),o=this.choNgoi(t,t.omNon),h=this.raTheGioi(i,o.x+6,o.y-196*o.k*.42),n=(t,e,i,a,o)=>{let h=t.x+(e.x-t.x)*i,n=t.y+(e.y-t.y)*i-Math.sin(Math.PI*i)*a;this.veNonTai(h,n,74,Math.floor(14*i),.6*Math.sin(i*o))},l=t.M.gio+.2,r=t.M.gio+1.7;e>l&&e<r&&n(a,h,(e-l)/(r-l),260,9);let s=t.M.tanh+.2,u=t.M.tanh+.8;e>s&&e<u&&n(h,a,(e-s)/(u-s),90,4)}mauTroi(t,i,a){return b(b(x.em[a],x.bao[a],(0,e.G)(t)),x.am[a],i*(1-(0,e.G)(t)))}veTroi(t,i,a,o,h){let n=this.ctx,l=n.createLinearGradient(0,0,0,.66*i);l.addColorStop(0,y(this.mauTroi(a,o,0))),l.addColorStop(.55,y(this.mauTroi(a,o,1))),l.addColorStop(1,y(this.mauTroi(a,o,2))),n.fillStyle=l,n.fillRect(0,0,t,i);let r=(1-(0,e.G)(1.6*a))*(.7+.3*o);if(r>.02){let e=.82*t,a=.12*i,o=.09*i,h=n.createRadialGradient(e,a,0,e,a,4*o);h.addColorStop(0,`rgba(255, 250, 225, ${.95*r})`),h.addColorStop(.18,`rgba(255, 236, 170, ${.7*r})`),h.addColorStop(1,"rgba(255, 220, 150, 0)"),n.fillStyle=h,n.fillRect(e-4*o,a-4*o,8*o,8*o)}let s=1-(0,e.G)(1.5*a);if(s>.02){n.fillStyle=`rgba(255, 255, 255, ${.75*s})`;for(let e=0;e<6;e++){let a=((1.4*m(e)*t-h*(6+2*e))%(1.4*t)+1.4*t)%(1.4*t)-.2*t,o=i*(.08+.22*m(e+9)),l=i*(.035+.03*m(e+3));for(let[t,e,i]of(n.beginPath(),[[0,0,1],[1.1,.25,.8],[-1,.3,.75],[.45,-.45,.8],[2,.4,.55]]))n.moveTo(a+t*l+i*l,o+e*l),n.arc(a+t*l,o+e*l,i*l,0,2*Math.PI);n.fill()}}}veMayGiong(t,i,a,o,h,n){let l=this.bo.fx.may;if(!l||o<.02||i<0)return;let r=this.ctx;r.save(),r.globalAlpha=(0,e.G)(1.3*o);for(let t=0;t<7;t++){let i=t%l.so,s=900+500*m(t+5),u=s*l.h/l.w,c=n+s+400,g=h+((m(t)*c-a*(40+6*t))%c+c)%c-.6*s,f=-60+200*m(t+2)-(1-(0,e.G)(o))*200;r.drawImage(l.anh,i*l.w,0,l.w,l.h,g,f,s,u)}r.restore()}veCauVong(t){let e=this.ctx,i=s;e.save(),e.lineWidth=22,["255,80,80","255,160,60","255,230,90","110,220,110","90,170,255","150,110,230"].forEach((a,o)=>{e.strokeStyle=`rgba(${a}, ${.34*t})`,e.beginPath(),e.arc(i,760,820-20*o,1.08*Math.PI,1.92*Math.PI),e.stroke()}),e.restore()}veCo(t,e,i,a,o){let h=this.bo.fx.co;if(h&&(e<0||e<t.M.gio-1||e>t.M.tanh+1))for(let t=0;t<3;t++){let e=o+600,n=a-300+((i*(70+12*t)+m(t+20)*e)%e+e)%e,l=150+46*t+14*Math.sin(1.4*i+t);this.veDai(h,Math.floor(8*i+2*t),n,l,46+8*t,h.h-2*h.le,!1)}}veNen(t,e){let i=this.ctx,{nen:a}=this.bo,o=t=>t.width/t.height*900,h=(a,h,n=0)=>{a&&h<e&&h+o(a)>t&&i.drawImage(a,h,n,o(a)+1,900)},n=a["nen-song"],l=a["nen-ben-di"];if(n)for(let t=(l?o(l):0)-260;t<6500;t+=o(n)-2)h(n,t,52);h(l,0)}veBenDen(t,e){let i=this.bo.nen["nen-ben-den"];if(!i)return;let a=i.width/i.height*900;5900<e&&5900+a>t&&this.ctx.drawImage(i,5900,298.1,a+1,900)}matSong;song(t,e,i,a){let o=90+300*i,h=e*(.6+2.6*a);return(1.2+15*a)*(.25+.75*i)*(Math.sin(t/o*6.283+1.7*h+5*i)+.5*Math.sin(t/(.53*o)*6.283-2.3*h+11*i)+.25*Math.sin(t/(.27*o)*6.283+3.1*h))}mauNuoc(t,i,a){return b(b(v.em[a],v.bao[a],(0,e.G)(t)),v.am[a],i*(1-(0,e.G)(t))*.6)}veNuocSau(t,i,a,o,h,n){let l=this.ctx,r=l.createLinearGradient(0,578,0,900);r.addColorStop(0,y(this.mauNuoc(i,a,0))),r.addColorStop(.35,y(this.mauNuoc(i,a,1))),r.addColorStop(1,y(this.mauNuoc(i,a,2))),l.fillStyle=r,l.fillRect(o-50,576,h-o+100,722),l.fillStyle=`rgba(30, 70, 60, ${.18*(1-.5*i)})`,l.fillRect(o-50,578,h-o+100,26),this.hangSong(t,i,a,o,h,0,.6);let s=(1-(0,e.G)(1.8*i))*.8;if(s>.02){l.fillStyle=`rgba(255, 252, 230, ${s})`;for(let e=0;e<70;e++){let i=m(e+.3),a=586+i*i*322,n=o+((m(e+50)*(h-o)+12*t*(1+i))%(h-o)+(h-o))%(h-o);l.globalAlpha=.5+.5*Math.sin(3*t+1.7*e),l.fillRect(n,a,8+26*i,1.2+2*i)}l.globalAlpha=1}let u=this.raTheGioi(n,30,225);l.strokeStyle=`rgba(255, 255, 255, ${.35-.15*i})`,l.lineWidth=3;for(let e=0;e<4;e++){let i=(60*t+70*e)%280;l.globalAlpha=1-i/280,l.beginPath(),l.ellipse(u.x-i,u.y+6,30+.5*i,4+.04*i,0,.6*Math.PI,1.4*Math.PI),l.stroke()}l.globalAlpha=1}hangSong(t,e,i,a,o,h,n,l=!1){let r=this.ctx,s=t=>578+382*Math.pow(h+t/15*(n-h),1.5),u=l?2:4,c=(1.2+15*e)*3.5+30;for(let g=0;g<16;g++){let f=h+g/15*(n-h),d=s(g),M=g+u>=16?1200:s(g+u)+c,x=b(this.mauNuoc(e,i,1),this.mauNuoc(e,i,2),f),v=a-40,m=Math.floor((o+40-v)/14)+1;this.matSong.length<m+2&&(this.matSong=new Float32Array(m+2));let T=this.matSong;for(let i=0;i<m+2;i++)T[i]=this.song(v+(i-1)*14,t,f,e);r.beginPath(),r.moveTo(v,M);for(let t=0;t<m;t++)r.lineTo(v+14*t,d+T[t+1]);r.lineTo(o+40,M),r.closePath(),r.fillStyle=y(x,l?.96:.55),r.fill(),r.beginPath(),r.moveTo(v,d+T[1]-1);for(let t=1;t<m;t++)r.lineTo(v+14*t,d+T[t+1]-1);if(r.strokeStyle=`rgba(235, 250, 255, ${.16+.22*f})`,r.lineWidth=1+2.5*f,r.stroke(),e>.25){r.strokeStyle=`rgba(255, 255, 255, ${Math.min(.85,(e-.25)*.9)*(.4+.6*f)})`,r.lineWidth=2+4*f,r.beginPath();for(let t=0;t<m;t++){let e=v+14*t,i=T[t+1];T[t]>i&&T[t+2]>=i&&(r.moveTo(e-18-20*f,d+i+2),r.quadraticCurveTo(e,d+i-5,e+18+22*f,d+i+3))}r.stroke()}}}veNuocTruoc(t,e,i,a,o,h){let n=this.ctx;this.hangSong(t,e,i,a,o,.69,1,!0),n.save(),n.strokeStyle=`rgba(255, 255, 255, ${.5+.3*e})`,n.lineWidth=3;for(let e=0;e<9;e++){let i=120+160*e,a=this.raTheGioi(h,i,236),o=(1.6*t+.37*e)%1;n.globalAlpha=1-o,n.beginPath(),n.ellipse(a.x,a.y+4,40+50*o,4+3*o,h.goc,.05*Math.PI,.95*Math.PI),n.stroke()}if(n.restore(),e>.15){n.strokeStyle=`rgba(230, 240, 245, ${.5*e})`,n.lineWidth=1.5;let i=Math.floor(40*e);for(let e=0;e<i;e++){let i=Math.floor(3*t+10*m(e)),h=(3*t+10*m(e))%1,l=a+m(3*e+i)*(o-a),r=598+322*Math.pow(m(7*e+i),.7),s=4+16*h*((r-578)/322+.3);n.globalAlpha=1-h,n.beginPath(),n.ellipse(l,r,s,.3*s,0,0,2*Math.PI),n.stroke()}n.globalAlpha=1}}veBot(t,i,a){let o=this.bo.fx.bot;if(!o)return;let h=(0,e.u)(t,i);if(!(h<.45)&&!(i>t.M.tanh))for(let t=0;t<2;t++){let e=Math.floor((i+.45*t)/.9),n=(i+.45*t)%.9/.6;if(n>=1)continue;let l=250+1100*m(2*e+t),r=this.raTheGioi(a,l,205);this.veDai(o,Math.floor(n*o.so),r.x,r.y+30,150+60*h,o.h-2*o.le,m(e)>.5)}}veSongLon(t,i,a,o){let h=this.bo.fx["song-lon"],{M:n}=t;if(i<n.song||i>n.songVo+1)return;let l=i<n.songVo?Math.min(2,Math.floor((i-n.song)/(n.songVo-n.song)*3)):Math.min(5,3+Math.floor((i-n.songVo)/1*3));if(o!==l>=3)return;let r=this.raTheGioi(a,40,230);if(h&&this.veDai(h,l,r.x-(l>=3?150:250),r.y+95,380,h.h-2*h.le,!0),o&&i>=n.songVo&&i<n.songVo+1.2){let t=this.ctx,o=this.raTheGioi(a,118,-28),h=i-n.songVo;t.fillStyle="rgba(235, 248, 255, 0.85)";for(let i=0;i<46;i++){let a=120+380*m(i),n=-260-300*m(i+40),l=o.x+a*h,r=o.y+n*h+900*h*h,s=3+6*m(i+7);t.globalAlpha=(0,e.G)(1.2-h),t.beginPath(),t.arc(l,r,s,0,2*Math.PI),t.fill()}t.globalAlpha=1}}veTinhTietSau(t,i,a){let o=this.ctx,h=t.tTinhTiet;if("xoay"===t.tinhTiet&&i>h-1.4&&i<h+2.8){let t=Math.sin(Math.PI*(0,e.G)((i-h+1.4)/4.2)),n=this.raTheGioi(a,1440,240),l=n.x+200,r=n.y+20;o.save(),o.lineWidth=4;for(let e=0;e<7;e++){o.strokeStyle=`rgba(${e%2?"20,50,60":"230,245,250"}, ${.55*t})`;let a=30+30*e;o.beginPath(),o.ellipse(l,r,1.5*a,.32*a,0,i*(5-.4*e)+e,i*(5-.4*e)+e+1.3*Math.PI),o.stroke()}o.restore()}}veTinhTietTruoc(t,i,a){let o=t.tTinhTiet;if("lucBinh"===t.tinhTiet){let t=this.bo.fx["luc-binh"];if(!t||i<o-2.6||i>o+2.6)return;let e=this.raTheGioi(a,-10,250),h,n,l=0;if(i<o){let t=(i-o+2.6)/2.6;h=e.x+500*(1-t),n=e.y+10}else if(i<o+1.4)h=e.x+6*Math.sin(40*i),n=e.y+4;else{let t=(i-o-1.4)/1.2;h=e.x-260*t,n=e.y-160*Math.sin(Math.PI*t),l=4*t}let r=this.ctx;r.save(),r.translate(h,n),r.rotate(l),this.veDai(t,1,0,0,80,t.h-2*t.le,!1),r.restore()}if("ca"===t.tinhTiet){let h=this.bo.fx.ca,n=(i-o)/1.3;if(!h||n<0||n>1)return;let l=this.raTheGioi(a,1500,210).x+10+210*n,r=this.matNuocGan(l,i,(0,e.u)(t,i));this.veDai(h,Math.floor(n*h.so),l,r+40,230,h.h-2*h.le,!1)}}veMua(t,i,a,o){if(a<.05)return;let h=this.ctx,n=-.45*(0,e.G)(a);for(let[l,r,s,u,c]of[[0,220,.03,1,.3],[1,120,.05,2,.5]]){let g=Math.floor(r*(0,e.G)(a));h.strokeStyle=`rgba(210, 225, 235, ${c})`,h.lineWidth=i/900*u,h.beginPath();let f=(l?1.6:1.1)*i,d=f*n;for(let e=0;e<g;e++){let a=((m(e+500*l)*t*1.5+o*d)%(1.5*t)+1.5*t)%(1.5*t)-.1*t,r=((m(3*e+7+900*l)*i+o*f)%i+i)%i,u=s*i;h.moveTo(a,r),h.lineTo(a+u*n,r+u)}h.stroke()}}veGio(t,e,i,a,o,h){if(o<.25||a>i.M.tanh)return;let n=this.ctx;n.strokeStyle=`rgba(255, 255, 255, ${.22*o})`,n.lineWidth=e/900*2;for(let i=0;i<12;i++){let a=(h*(.5+.4*m(i))+m(i+3))%1,o=t*(1.1-1.3*a),l=e*(.1+.6*m(i+11));n.globalAlpha=Math.sin(Math.PI*a),n.beginPath(),n.moveTo(o,l),n.bezierCurveTo(o-.06*t,l-.02*e,o-.12*t,l+.02*e,o-.2*t,l),n.stroke()}n.globalAlpha=1;for(let i=0;i<10;i++){let a=t*(1.05-1.2*((h*(.35+.3*m(i+30))+m(i+31))%1)),o=e*(.2+.5*m(i+33))+Math.sin(4*h+i)*e*.03;n.save(),n.translate(a,o),n.rotate(6*h+i),n.fillStyle=i%3?"#5b9a3a":"#c79a3a",n.beginPath(),n.ellipse(0,0,e/900*7,e/900*3,0,0,2*Math.PI),n.fill(),n.restore()}}veSet(t,e,i,a,o,h,n,l,r){let s=this.ctx;for(let[u,c]of t.set.entries()){let g=e-c;if(g<0||g>.45)continue;let f="set"===t.tinhTiet&&c===t.tTinhTiet;if(s.fillStyle=`rgba(235, 242, 255, ${(f?.75:.5)*(1-g/.45)*(g<.08||g>.16?1:.3)})`,s.fillRect(0,0,i,a),g>.25)continue;let d=(l+r*(.55+.35*m(u+70)))*o+h,M=-20,b=578*o+n;s.save(),s.strokeStyle="rgba(255, 255, 255, 0.95)",s.shadowColor="rgba(170, 200, 255, 0.95)",s.shadowBlur=24,s.lineWidth=a/900*(f?5:3),s.beginPath(),s.moveTo(d,M);let y=0;for(;M<b;)d+=(m(31*u+ ++y)-.5)*70*(a/900),M+=(30+40*m(17*u+y))*(a/900),s.lineTo(d,Math.min(M,b));s.stroke(),s.restore()}}veTiaNang(t,e,i,a){let o=this.ctx;o.save(),o.globalCompositeOperation="lighter";let h=.82*t,n=-(.05*e);for(let t=0;t<7;t++){let l=1.75+.16*t+.03*Math.sin(.3*a+t),r=.035+.03*m(t+60);o.fillStyle=`rgba(255, 220, 150, ${.07*i})`,o.beginPath(),o.moveTo(h,n),o.lineTo(h+Math.cos(l-r)*e*2,n+Math.sin(l-r)*e*2),o.lineTo(h+Math.cos(l+r)*e*2,n+Math.sin(l+r)*e*2),o.closePath(),o.fill()}o.restore()}veHatSang(t,i){let a=t.diu[t.diu.length-1];if(!a||i<a.t0+.6)return;let o=this.ctx,h=(0,e.G)((i-a.t0-.6)/.8),n=a?this.xHatSang:0,l=o.createRadialGradient(n,556,0,n,556,260);l.addColorStop(0,`rgba(255, 226, 150, ${.35*h})`),l.addColorStop(1,"rgba(255, 226, 150, 0)"),o.fillStyle=l,o.fillRect(n-260,296,520,520);for(let t=0;t<34;t++){let e=(i*(.25+.25*m(t))+m(t+4))%1,a=n+(m(t+8)-.5)*300+10*Math.sin(2*i+t),l=696-300*e,r=1.5+3.5*m(t+12);o.fillStyle=`rgba(255, 246, 200, ${h*Math.sin(Math.PI*e)})`,o.beginPath(),o.arc(a,l,r,0,2*Math.PI),o.fill()}}xHatSang;mayQuay(t,i,a,o){let h=Math.min(1,900*o/1420),n={cx:a.x+40,cy:470,z:h};if(i<0)return n;let{M:l}=t,r=(t,e,i)=>({cx:t.cx+(e.cx-t.cx)*i,cy:t.cy+(e.cy-t.cy)*i,z:t.z+(e.z-t.z)*i}),s={cx:this.raTheGioi(a,388,122).x,cy:560,z:1.2*h},u=n;if(i>l.song-.3&&i<l.tanh+1.2&&(u=r(n,s,i<l.tanh?(0,e.c)((i-l.song+.3)/.8):1-(0,e.c)((i-l.tanh)/1.2))),"ca"===t.tinhTiet){let a=Math.min((0,e.c)((i-t.tTinhTiet+.8)/.7),1-(0,e.c)((i-t.tTinhTiet-1.6)/.9));a>0&&(u={...u,cx:u.cx+330*a})}let c=t.diu[t.diu.length-1];if(c&&i>c.t0-2.4){let o=this.xDiu(t,c.ten,a)-30;this.xHatSang=o,u=r(u,{cx:o,cy:536,z:1.45*h},(0,e.c)((i-c.t0+2.4)/1.6)),u=r(u,{cx:o-430,cy:451,z:1.25*h},(0,e.c)((i-t.M.the+.4)/1))}return u}xepTen(t,e){let i=[],a=[];for(let o of[...t].sort((t,e)=>Number(e.chon)-Number(t.chon)||e.y-t.y)){let t=(.58*o.ten.length+.9)*o.coChu,h=1.4*o.coChu,n=o.y;for(let l=0;l<3;l++){let r={x0:o.x-t/2,x1:o.x+t/2,y0:n-h,y1:n};if(!i.some(t=>t.x0<r.x1&&r.x0<t.x1&&t.y0<r.y1&&r.y0<t.y1)){i.push(r),a.push({...o,y:n-h});break}n-=.9*h,2===l&&(o.chon||e<=20)&&(i.push({...r}),a.push({...o,y:n-h}))}}return a}chuHieuUng(t,e,i,a){return t.chu.filter(t=>e>=t.t0&&e<t.t0+t.dai).map(t=>({id:t.id,chu:t.chu,k:(e-t.t0)/t.dai,lon:t.lon,x:i*(t.lon?.5:.66),y:a*(t.lon?.3:.24)}))}thoai(t,e,i,a,o,h){let n=[];for(let[l,r]of t.thoai.entries()){if(e<r.t0||e>=r.t1)continue;let t=i[r.ai];t&&n.push({id:`${l}`,chu:r.chu,x:(t.x*a+o)/this.dpr,y:(t.y*a+h)/this.dpr-6})}return n.slice(-4)}}

  // 7. Launcher Implementation
  function launchChuyenDoSangSong(container, options = {}) {
    injectStyles();

    if (options.assetBaseUrl) {
      FERRY_ASSET_BASE = options.assetBaseUrl;
    } else if (typeof window !== 'undefined' && window.location.pathname.includes('/ey/')) {
      FERRY_ASSET_BASE = '/ey/games/ferry';
    }

    const roster = options.roster && options.roster.length > 0 ? options.roster : [
      "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Long", "Phạm Minh Thư",
      "Vũ Đức Thịnh", "Hoàng Thảo My", "Đỗ Tuấn Kiệt", "Bùi Lan Hương",
      "Đặng Quốc Bảo", "Ngô Phương Anh", "Mai Văn Hùng", "Dương Thuỳ Linh",
      "Lý Bảo Châu", "Đinh Hữu Phước", "Phan Nhật Nam", "Lâm Mỹ Duyên",
      "Hồ Quang Vinh", "Võ Kim Ngân", "Đoàn Gia Huy", "Tạ Bích Phương"
    ];

    const studentGenders = options.gioiTinh || {};
    let currentTeacherGender = (options.teacherGender === "female" || options.teacherGender === "co") ? "co" : "thay";
    let currentSchoolName = options.lessonTitle || options.schoolName || "TRƯỜNG THPT SỐ 1 LÊ HỒNG PHONG";

    let getTeacherWord = () => currentTeacherGender === "co" ? "Cô" : "Thầy";

    container.innerHTML = `
      <div class="cd-shell fixed inset-0 z-[60] flex flex-col overflow-hidden select-none">
        <canvas id="cd-canvas"></canvas>
        <div id="cd-lop" class="cd-lop" style="position: absolute; inset: 0; pointer-events: none; z-index: 20;"></div>
        <div id="cd-lop-chu" style="position: absolute; inset: 0; pointer-events: none; z-index: 25;"></div>
        <div id="cd-lop-thoai" style="position: absolute; inset: 0; pointer-events: none; z-index: 26;"></div>
        
        <!-- Header Topbar -->
        <header class="cd-topbar mooncake-topbar">
          <div class="mooncake-topbar__info">
            <div id="cd-title-badge" style="font-weight: 800; font-size: 15px; color: #042f2e; background: rgba(204, 251, 241, 0.95); padding: 6px 14px; border-radius: 12px; border: 1px solid #5eead4; box-shadow: 0 2px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 6px;">
              <span>⛵ Chuyến Đò Sang Sông · <span id="cd-school-name">${currentSchoolName}</span></span>
              <button type="button" id="cd-btn-edit-title" class="cd-edit-btn" title="Đổi tiêu đề / trường học">✏️</button>
            </div>
          </div>

          <!-- Live Switcher Thầy / Cô -->
          <div class="tg-teacher-switcher">
            <button type="button" id="cd-btn-choose-thay" class="tg-teacher-btn ${currentTeacherGender === 'thay' ? 'is-active' : ''}">
              👨‍🏫 Thầy
            </button>
            <button type="button" id="cd-btn-choose-co" class="tg-teacher-btn ${currentTeacherGender === 'co' ? 'is-active' : ''}">
              👩‍🏫 Cô
            </button>
          </div>

          <div class="cd-topbar__actions" style="display: flex; align-items: center; gap: 8px;">
            <button type="button" id="cd-btn-sound" class="cd-topbar-btn" title="Bật/Tắt âm thanh">🔊</button>
            <button type="button" id="cd-btn-fs" class="cd-topbar-btn" title="Toàn màn hình">⛶</button>
            <button type="button" id="cd-btn-pause" class="cd-topbar-btn" style="display: none;">Tạm dừng</button>
            <button type="button" id="cd-btn-exit" class="cd-topbar-btn" style="color: #b91c1c; background: #fee2e2;">Thoát</button>
          </div>
        </header>

        <!-- Bottom Controller Bar (Nút Bắt Đầu Đưa Đò Qua Sông) -->
        <div id="cd-bottom-bar" class="cd-bang-nen">
          <div class="cd-bang">
            <div class="cd-bang__hang">
              <span class="cd-nhan">Số em cập bờ:</span>
              <button type="button" class="cd-nut-so cd-nut-so--chon" data-count="1">1</button>
              <button type="button" class="cd-nut-so" data-count="2">2</button>
              <button type="button" class="cd-nut-so" data-count="3">3</button>
              <button type="button" class="cd-nut-so" data-count="4">4</button>
              <button type="button" class="cd-nut-so" data-count="5">5</button>
            </div>
            <button type="button" id="cd-btn-call" class="cd-nut cd-nut--lon">Đưa đò qua sông</button>
            <p id="cd-subtitle" style="font-size: 13.5px; color: #0e7490; margin: 0; font-weight: 700;">
              ${getTeacherWord()} đưa trò qua sông giông bão. Em cập bờ cuối cùng lên bảng!
              <button type="button" id="cd-btn-reset" style="background: none; border: none; color: #0d9488; font-weight: 800; text-decoration: underline; cursor: pointer; display: none; margin-left: 6px;">Làm mới</button>
            </p>
          </div>
        </div>

        <!-- Result Card / Modal -->
        <div id="cd-result-modal" class="cd-the-nen" style="display: none;">
          <div class="cd-hop mooncake-pop">
            <p id="cd-result-title" class="cd-hop__moi">Chúc mừng em đã cập bến tri thức!</p>
            <div id="cd-result-list" class="cd-hop__ds"></div>
            <div style="display: flex; justify-content: center; gap: 12px; margin-top: 14px;">
              <button type="button" id="cd-btn-next" class="cd-nut cd-nut--lon">Chuyến đò tiếp theo</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#cd-canvas');
    const layerNames = container.querySelector('#cd-lop');
    const layerChu = container.querySelector('#cd-lop-chu');
    const layerThoai = container.querySelector('#cd-lop-thoai');
    const bottomBar = container.querySelector('#cd-bottom-bar');
    const btnCall = container.querySelector('#cd-btn-call');
    const btnReset = container.querySelector('#cd-btn-reset');
    const btnPause = container.querySelector('#cd-btn-pause');
    const btnExit = container.querySelector('#cd-btn-exit');
    const btnSound = container.querySelector('#cd-btn-sound');
    const btnFs = container.querySelector('#cd-btn-fs');
    const resultModal = container.querySelector('#cd-result-modal');
    const resultTitle = container.querySelector('#cd-result-title');
    const resultList = container.querySelector('#cd-result-list');
    const btnNext = container.querySelector('#cd-btn-next');
    const countBtns = container.querySelectorAll('.cd-nut-so');
    const subtitleEl = container.querySelector('#cd-subtitle');

    const btnChooseThay = container.querySelector('#cd-btn-choose-thay');
    const btnChooseCo = container.querySelector('#cd-btn-choose-co');
    const btnEditTitle = container.querySelector('#cd-btn-edit-title');
    const schoolNameEl = container.querySelector('#cd-school-name');

    let scene = null;
    let state = "sanh";
    let isPaused = false;
    let pickCount = 1;
    let calledNames = [];
    let lastCalled = [];
    let isDestroyed = false;
    let animId = 0;
    let nameDomMap = new Map();
    let wordDomMap = new Map();
    let speechDomMap = new Map();

    countBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        countBtns.forEach(b => b.classList.remove('cd-nut-so--chon'));
        btn.classList.add('cd-nut-so--chon');
        pickCount = parseInt(btn.dataset.count, 10) || 1;
      });
    });

    // EDIT TITLE LIVE
    btnEditTitle.addEventListener('click', () => {
      let newTitle = prompt("Nhập tiêu đề chuyến đò (Tên trường / Lớp / Bài học):", currentSchoolName);
      if (newTitle !== null && newTitle.trim()) {
        currentSchoolName = newTitle.trim();
        if (schoolNameEl) schoolNameEl.textContent = currentSchoolName;
      }
    });

    // LIVE TEACHER SWITCHER
    function switchTeacher(gender) {
      if (currentTeacherGender === gender) return;
      currentTeacherGender = gender;
      let isCo = (currentTeacherGender === 'co');

      btnChooseThay.classList.toggle('is-active', !isCo);
      btnChooseCo.classList.toggle('is-active', isCo);

      if (subtitleEl) {
        subtitleEl.innerHTML = `${getTeacherWord()} đưa trò qua sông giông bão. Em cập bờ cuối cùng lên bảng! <button type="button" id="cd-btn-reset" style="background: none; border: none; color: #0d9488; font-weight: 800; text-decoration: underline; cursor: pointer; display: none; margin-left: 6px;">Làm mới</button>`;
      }

      if (scene) {
        scene.doiGiaoVien(currentTeacherGender);
      }
    }

    btnChooseThay.addEventListener('click', () => switchTeacher('thay'));
    btnChooseCo.addEventListener('click', () => switchTeacher('co'));

    let isSoundOn = true;
    btnSound.addEventListener('click', () => {
      isSoundOn = !isSoundOn;
      soundSettings.setEnabled(isSoundOn);
      btnSound.textContent = isSoundOn ? '🔊' : '🔇';
    });

    btnFs.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });

    btnPause.addEventListener('click', () => {
      isPaused = !isPaused;
      scene?.datTamDung(isPaused);
      btnPause.textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';
      if (isPaused) ferryAudio.tatNen();
      else ferryAudio.batNen();
    });

    btnExit.addEventListener('click', () => {
      cleanup();
      if (typeof options.onExit === 'function') options.onExit();
    });

    // HOTKEYS (Space, Enter)
    function handleKeyDown(e) {
      if (e.target?.tagName === 'INPUT') return;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (state === 'sanh') {
          startTurn();
        } else if (state === 'chuyen') {
          isPaused = !isPaused;
          scene?.datTamDung(isPaused);
          btnPause.textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';
          if (isPaused) ferryAudio.tatNen();
          else ferryAudio.batNen();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (state === 'the') {
          calledNames = [...new Set([...calledNames, ...lastCalled])];
          resultModal.classList.remove('open');
          resultModal.style.display = 'none';
          bottomBar.classList.remove('hidden');
          bottomBar.style.setProperty('display', 'flex', 'important');
          state = "sanh";
          startTurn();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    function handleResize() {
      if (!canvas || !scene) return;
      let w = window.innerWidth || canvas.clientWidth || 1536;
      let h = window.innerHeight || canvas.clientHeight || 1024;
      scene.doiCo(w, h, dpr);
    }
    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);
    window.addEventListener('resize', handleResize);

    const characters = FerryLogic.D(roster, studentGenders, Math.random);
    const nicknames = getShortNames(roster);

    function startTurn() {
      if (!scene) return;
      let plan = FerryLogic.F(roster, new Set(calledNames), characters, { nguoiLai: currentTeacherGender, pickCount: pickCount });
      if (!plan || !plan.chon) {
        calledNames = [];
        plan = FerryLogic.F(roster, new Set(), characters, { nguoiLai: currentTeacherGender, pickCount: pickCount });
      }
      lastCalled = Array.isArray(plan.chon) ? plan.chon : [plan.chon];
      scene.batDauChuyen(plan);
      state = "chuyen";
      isPaused = false;
      bottomBar.classList.add('hidden');
      bottomBar.style.setProperty('display', 'none', 'important');
      resultModal.classList.remove('open');
          resultModal.style.display = 'none';
      btnPause.style.display = 'inline-flex';
      ferryAudio.batNen();
    }

    btnCall.addEventListener('click', startTurn);

    btnNext.addEventListener('click', () => {
      calledNames = [...new Set([...calledNames, ...lastCalled])];
      resultModal.classList.remove('open');
          resultModal.style.display = 'none';
      bottomBar.classList.remove('hidden');
          bottomBar.style.setProperty('display', 'flex', 'important');
      state = "sanh";
      startTurn();
    });

    btnReset.addEventListener('click', () => {
      calledNames = [];
      btnReset.style.display = 'none';
    });

    // Badges synchronizer
    function renderBadges(badgeData) {
      if (!badgeData || !badgeData.ten) return;
      let activeIds = new Set(badgeData.ten.map(b => b.ten));
      for (let [id, el] of nameDomMap) {
        if (!activeIds.has(id)) {
          el.remove();
          nameDomMap.delete(id);
        }
      }
      for (let b of badgeData.ten) {
        let el = nameDomMap.get(b.ten);
        if (!el) {
          el = document.createElement('div');
          el.className = 'cd-ten';
          el.textContent = b.ten;
          layerNames.appendChild(el);
          nameDomMap.set(b.ten, el);
        }
        el.className = 'cd-ten' + (b.nguy ? ' is-nguy' : '') + (b.chon ? ' is-chon' : '');
        el.style.fontSize = `${b.coChu.toFixed(1)}px`;
        el.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px) translate(-50%, 0)`;
      }
    }

    // Floating Words synchronizer (GIÓ TO, SÓNG LỚN, ẦM!...)
    function renderWords(wordsData) {
      let activeIds = new Set();
      if (wordsData) {
        for (let w of wordsData) {
          activeIds.add(w.id);
          let el = wordDomMap.get(w.id);
          if (!el) {
            el = document.createElement('div');
            el.className = w.lon ? 'cd-chu cd-chu--lon' : 'cd-chu';
            el.textContent = w.chu;
            layerChu.appendChild(el);
            wordDomMap.set(w.id, el);
          }
          let scale = w.k < 0.15 ? (0.4 + w.k / 0.15 * 0.8) : (1.2 - Math.min(0.2, (w.k - 0.15) * 0.4));
          el.style.opacity = w.k > 0.8 ? ((1 - w.k) / 0.2).toFixed(3) : "1";
          el.style.transform = `translate(${w.x.toFixed(1)}px, ${(w.y - 30 * w.k).toFixed(1)}px) translate(-50%, -50%) scale(${scale.toFixed(3)}) rotate(-5deg)`;
        }
      }
      for (let [id, el] of wordDomMap) {
        if (!activeIds.has(id)) {
          el.remove();
          wordDomMap.delete(id);
        }
      }
    }

    // Speech Bubbles synchronizer (lời thoại Thầy/Cô và học sinh)
    function renderSpeech(speechData) {
      let activeIds = new Set();
      if (speechData) {
        for (let s of speechData) {
          activeIds.add(s.id);
          let el = speechDomMap.get(s.id);
          if (!el) {
            el = document.createElement('div');
            el.className = 'cd-thoai';
            el.textContent = s.chu;
            layerThoai.appendChild(el);
            speechDomMap.set(s.id, el);
          }
          el.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) translate(-50%, -100%)`;
        }
      }
      for (let [id, el] of speechDomMap) {
        if (!activeIds.has(id)) {
          el.remove();
          speechDomMap.delete(id);
        }
      }
    }

    (async () => {
      try {
        ferryAudio.napTruoc();
        let [bo, sanh] = await Promise.all([
          p(Object.values(characters), currentTeacherGender),
          Promise.resolve(FerryLogic.F(roster, new Set(), characters, { nguoiLai: currentTeacherGender }))
        ]);

        scene = await CanhChuyenDo.tao(canvas, bo, sanh, nicknames);
        if (isDestroyed) return;
        window.__ferryScene = scene;

        scene.onMoc = e => {
          if (e === "the") {
            state = "the";
            btnPause.style.display = 'none';
            resultTitle.textContent = lastCalled.length > 1 ? "Mời các em lên bảng!" : "Mời em lên bảng!";
            resultList.innerHTML = lastCalled.map(name => `<div class="cd-hop__ten">${name}</div>`).join('');
            resultModal.classList.add('open');
            resultModal.style.display = 'flex';
            ferryAudio.tatNen();
          }
          ferryAudio.phat(e);
        };

        handleResize();
        state = "sanh";

        let lastTime = performance.now();
        let loop = now => {
          if (isDestroyed) return;
          animId = requestAnimationFrame(loop);
          let dt = (now - lastTime) / 1000;
          lastTime = now;

          if (scene) {
            let w = canvas.clientWidth || window.innerWidth;
            let h = canvas.clientHeight || window.innerHeight;
            let frame = scene.khungHinh(dt, w, h);
            if (frame) {
              renderBadges(frame);
              renderWords(frame.chu);
              renderSpeech(frame.thoai);
            }
          }
        };
        animId = requestAnimationFrame(loop);

      } catch (err) {
        console.error("Lỗi khởi tạo Chuyến Đò Sang Sông:", err);
      }
    })();

    function cleanup() {
      isDestroyed = true;
      if (animId) cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      ferryAudio.tatNen();
      scene = null;
      window.__ferryScene = null;
      container.innerHTML = '';
    }

    return cleanup;
  }

  if (typeof window !== 'undefined') {
    window.launchChuyenDoSangSong = launchChuyenDoSangSong;
    window.launchFerry = launchChuyenDoSangSong;
  }

})(typeof window !== 'undefined' ? window : globalThis);
