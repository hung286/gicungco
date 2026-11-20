const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jszip.min-BXVbx_Ig.js","assets/vendor-react-Cg7KvPel.js"])))=>i.map(i=>d[i]);
import{j as e,r as o}from"./vendor-react-Cg7KvPel.js";import{al as Fe,c as J,aG as Ke,a as Ee,b as ze,O as Le,D as Ue,d as Ye,T as Ce,e as Ge,q as ge,r as Je,B as fe,C as et,f as tt,a5 as ue,U as Be,a7 as nt,H as it,aE as st}from"./index-DnvAnRgE.js";import{updateLesson as rt,createLesson as ot,getUserLessons as at,deleteLesson as lt}from"./lessonService-CJSuoz9R.js";import{M as ve}from"./MathEditor-C8m33f1R.js";import{k as ct}from"./vendor-katex-DqEyuLHo.js";import{I as Te}from"./ImageUploader-C2Mgv3PB.js";import{A as dt}from"./AudioUploader-PS4etNG_.js";import{i as ut}from"./browser-image-compression-BzWLnoYn.js";import{D as mt,E as pt,F as ft}from"./vendor-firebase-CDwhJuH3.js";import{Q as gt,M as ht}from"./QuestionPickerModal-dbHE-EVI.js";import{g as xt,s as bt,t as me,V as vt}from"./types-BQLjhGWt.js";import{D as yt}from"./Download-DSW1OcfO.js";import{A as wt}from"./AssignGameModal-CpSFs4m2.js";import{T as jt,F as kt}from"./TeacherShareModal-R8H5GL6j.js";import{u as Ct}from"./useFeatureAccess-BtTw-79Y.js";import{F as Tt}from"./FeatureContentHeader-DYxiUIBO.js";import{F as Se}from"./FeatureItemCard-B5CPkd_A.js";import{u as St}from"./ListToolbar-B_hZBX6p.js";import{a as _e}from"./vendor-3d-BEYLZICz.js";import{s as qt,a as It,p as Nt}from"./MathText-CzgjkkV6.js";import{u as At}from"./DeleteLessonDialog-BzB1Rv21.js";import{T as Ft}from"./Tooltip-DCB9cXjh.js";import{H as Et}from"./HelpVideoModal-C7Z0lRLX.js";import{u as zt}from"./useFeaturePage-BIlcXIgD.js";import"./SimpleMathKeyboard-D9OABFRl.js";import"./Delete-DEBs_UM6.js";import"./AddPhotoAlternate-DqK_iAF4.js";import"./aiStudioStatus-C62U-Ivf.js";import"./MusicNote-1PX2oQSI.js";import"./LinearProgress-Cu6E8xRQ.js";import"./AutoAwesome-Cmbb--Xb.js";import"./Replay-ChDkVZzi.js";import"./Stop-DncKNDmn.js";import"./ToggleButtonGroup-DM8JlZOF.js";import"./Search-BEGSQTmG.js";import"./Checkbox-nzrVy8Qr.js";import"./FormControlLabel-B7CFE27I.js";import"./Image-C0jF5ZYx.js";import"./YouTube.esm-fSfC9dOi.js";import"./soundEffects-B8nCX6o3.js";import"./GameHeaderButtons-uB7MPitg.js";import"./index-CrNIjAPa.js";import"./assignmentService-CVYFAa4v.js";import"./joinCodeService-DZVtGwtI.js";import"./gameTypes-DIWVrjT3.js";import"./useShuffleQuestions-DU0E0NOy.js";import"./Cancel-D6EO8yIc.js";import"./HelpOutline-8ipt_9Db.js";import"./EmojiEvents-D1UYrchf.js";import"./questionSizing-x4siNrIB.js";import"./youtube-CL3k1rS8.js";import"./versusSessionService-CH-kVtuA.js";import"./htmlEmbedGameService-Cpf7o_P0.js";import"./InputAdornment-CNRtNYTU.js";import"./Link-lmSr9m2D.js";import"./WarningAmber-CIEs0qID.js";import"./RadioGroup-Brp2BJxJ.js";import"./Radio-CRc6E8oP.js";import"./teacherShareService-Bv-P7ySx.js";import"./classShareLessons-BLKX0ZJ_.js";import"./surveyScales-BPALTy85.js";import"./Tabs-XM3E6LHx.js";import"./CardContent-oAGfsUwU.js";import"./Edit-CQ4NWq8l.js";import"./PlayArrow-BVbPsDOV.js";const qe=Fe(e.jsx("path",{d:"M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-2 6h-2v2h2v2h-2v2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2v2h2z"})),Lt=Fe(e.jsx("path",{d:"M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2m0 14H3V5h18zm-5-6-7 4V7z"}));function Bt(t){const a=Math.floor(t),n=Math.floor(a/60),l=a%60;return`${String(n).padStart(2,"0")}:${String(l).padStart(2,"0")}`}function _t({quiz:t,index:a,onUpdate:n,onDelete:l,userId:i}){const{t:d}=J("interactiveVideo"),[m,h]=o.useState(!1),[T,k]=o.useState(""),[L,q]=o.useState(""),[I,w]=o.useState(!1),[A,v]=o.useState(""),f=o.useRef(null),p=t.type||"abcd",C=(s,c)=>{n(t.id,"option",{index:s,text:c})},j=(s,c)=>{n(t.id,"optionImage",{index:s,url:c})},B=()=>{if((t.options||[]).length>=4)return;const s=[...t.options||[]];s.push("");const c=[...t.optionImages||[]];c.length<s.length&&c.push(""),n(t.id,"options",s),n(t.id,"optionImages",c)},O=s=>{if((t.options||[]).length<=2)return;const c=[...t.options||[]];c.splice(s,1);const b=[...t.optionImages||[]];if(b.length>s&&b.splice(s,1),n(t.id,"options",c),n(t.id,"optionImages",b),p==="abcd")t.correct===s.toString()?n(t.id,"correct",""):parseInt(t.correct)>s&&n(t.id,"correct",(parseInt(t.correct)-1).toString());else if(p==="multiple"){const M=(t.correctIndices||[]).filter(N=>N!==s).map(N=>N>s?N-1:N);n(t.id,"correctIndices",M)}},z=s=>{s!==p&&(n(t.id,"type",s),s==="abcd"||s==="multiple"?((!t.options||t.options.length<2)&&(n(t.id,"options",["","","",""]),n(t.id,"optionImages",["","","",""])),s==="multiple"&&!t.correctIndices&&n(t.id,"correctIndices",[])):s==="true_false"?(!t.statements||t.statements.length<2)&&n(t.id,"statements",[{text:"",isTrue:!0},{text:"",isTrue:!1},{text:"",isTrue:!0},{text:"",isTrue:!1}]):s==="short_answer"&&(t.correctAnswer||n(t.id,"correctAnswer",""),t.alternativeAnswers||n(t.id,"alternativeAnswers",[])))},R=(s,c,b)=>{const S=[...t.statements||[]];S[s]={...S[s],[c]:b},n(t.id,"statements",S)},H=()=>{const s=f.current;if(!s)return;const c=s.selectionStart,b=s.selectionEnd;if(c===b||c===null||b===null)return;const S=t.question||"",M=S.substring(c,b).trim();if(!M)return;const N=S.substring(0,c)+"___"+S.substring(b);n(t.id,"question",N),n(t.id,"correctAnswer",M)},W=()=>{if(!t.correctAnswer)return;const s=(t.question||"").replace("___",t.correctAnswer);n(t.id,"question",s),n(t.id,"correctAnswer",""),n(t.id,"alternativeAnswers",[])},_=parseInt(t.minutes||0)*60+parseInt(t.seconds||0),x=()=>{k(t.minutes||"0"),q(t.seconds||"0"),h(!0)},F=()=>{n(t.id,"minutes",T||"0"),n(t.id,"seconds",L||"0"),h(!1)},Z=async(s,c)=>{if(c.type.startsWith("image/")){w(!0);try{const b=await ut(c,{maxSizeMB:.2,maxWidthOrHeight:1024,useWebWorker:!0,fileType:"image/jpeg"}),S=mt(Ke,`interactive-video-images/paste_${Date.now()}_${c.name||"image.jpg"}`),M=await pt(S,b),N=await ft(M.ref);s===null?n(t.id,"questionImage",N):n(t.id,"optionImage",{index:s,url:N})}catch(b){console.error("Image upload failed:",b)}finally{w(!1)}}},X=t.optionImages||[],K=t.options||[];return e.jsxs("div",{className:"quiz-entry-iv",children:[e.jsxs("div",{className:"quiz-entry-header",children:[e.jsxs("div",{className:"quiz-number-row",children:[e.jsxs("div",{className:"quiz-number",children:[d("quizEntry.question")," ",a+1]}),m?e.jsxs("div",{className:"time-edit-inline",children:[e.jsx("input",{type:"number",className:"time-mini-input",value:T,min:"0",onChange:s=>k(s.target.value),placeholder:"0"}),e.jsx("span",{className:"time-sep-mini",children:":"}),e.jsx("input",{type:"number",className:"time-mini-input",value:L,min:"0",max:"59",onChange:s=>q(s.target.value),placeholder:"0"}),e.jsx("button",{className:"time-confirm-btn",onClick:F,children:"✓"})]}):e.jsxs("div",{className:"time-badge-iv",onClick:x,title:d("quizEntry.timeClick"),children:["🕐 ",Bt(_)]})]}),e.jsx("button",{className:"delete-btn-iv",onClick:()=>l(t.id),children:"×"})]}),e.jsx("div",{style:{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"},children:[{id:"abcd",label:"1 Đáp án",icon:"🔤",color:"#1e88e5"},{id:"multiple",label:"Nhiều đáp án",icon:"☑️",color:"#7b1fa2"},{id:"true_false",label:"Đúng/Sai",icon:"✅",color:"#43a047"},{id:"short_answer",label:"Điền từ",icon:"✏️",color:"#ef6c00"}].map(s=>e.jsxs("button",{onClick:()=>z(s.id),style:{padding:"6px 12px",borderRadius:"16px",border:`1.5px solid ${p===s.id?s.color:"#e0e0e0"}`,background:p===s.id?s.color:"#f5f5f5",color:p===s.id?"#fff":"#666",fontWeight:600,fontSize:"0.8rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"},children:[e.jsx("span",{children:s.icon})," ",s.label]},s.id))}),e.jsx("div",{className:"question-input-wrapper",children:p==="short_answer"?e.jsx("textarea",{ref:f,value:t.question||"",onChange:s=>n(t.id,"question",s.target.value),placeholder:d("quizEntry.questionPlaceholder"),style:{width:"100%",minHeight:"80px",padding:"12px",borderRadius:"8px",border:"1px solid #ccc",fontSize:"1rem",resize:"vertical"}}):e.jsx(ve,{value:t.question,onChange:s=>n(t.id,"question",s),onImagePaste:s=>Z(null,s),placeholder:d("quizEntry.questionPlaceholder"),rows:2,size:"medium",variant:"minimal",toolbar:e.jsxs("div",{className:"qe-toolbar",children:[e.jsx(Te,{value:t.questionImage||"",onChange:s=>n(t.id,"questionImage",s),compact:!0,storagePath:"interactive-video-images"}),e.jsx(dt,{value:t.questionAudio||"",onChange:s=>n(t.id,"questionAudio",s),compact:!0})]})})}),t.questionImage&&e.jsxs("div",{className:"quiz-entry-img-preview",children:[e.jsx("img",{src:t.questionImage,alt:"question"}),e.jsx("button",{className:"qe-remove-media",onClick:()=>n(t.id,"questionImage",""),children:"×"})]}),t.questionAudio&&e.jsxs("div",{className:"quiz-entry-audio-preview",children:[e.jsx("audio",{controls:!0,src:t.questionAudio,style:{height:32,flex:1}}),e.jsx("button",{className:"qe-remove-media",onClick:()=>n(t.id,"questionAudio",""),children:"×"})]}),p==="short_answer"&&e.jsxs("div",{style:{marginTop:"16px",background:"#fff",padding:"16px",borderRadius:"8px",border:"1px solid #e0e0e0"},children:[e.jsx("div",{style:{padding:"8px 12px",background:"#fff8e1",border:"1px solid #ffe082",borderRadius:"8px",marginBottom:"12px",fontSize:"0.85rem",color:"#e65100",fontWeight:600},children:'💡 Bôi đen 1 chữ trong câu hỏi và nhấn "Tạo chỗ trống" để người dùng điền vào.'}),e.jsxs("div",{style:{display:"flex",gap:"8px",marginBottom:"12px"},children:[e.jsx("button",{onClick:H,disabled:!!t.correctAnswer,style:{background:"#ef6c00",color:"#fff",border:"none",padding:"6px 16px",borderRadius:"8px",fontWeight:600,cursor:t.correctAnswer?"not-allowed":"pointer",opacity:t.correctAnswer?.5:1},children:"Tạo chỗ trống"}),t.correctAnswer&&e.jsx("button",{onClick:W,style:{background:"transparent",color:"#ed6c02",border:"1px solid #ed6c02",padding:"6px 16px",borderRadius:"8px",fontWeight:600,cursor:"pointer"},children:"Hủy đáp án"})]}),t.correctAnswer&&e.jsxs("div",{children:[e.jsxs("div",{style:{marginBottom:"12px"},children:[e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:600,marginRight:"8px"},children:"Đáp án chính xác:"}),e.jsx("span",{style:{background:"#e8f5e9",color:"#2e7d32",padding:"4px 12px",borderRadius:"16px",fontWeight:600},children:t.correctAnswer})]}),e.jsxs("div",{children:[e.jsx("span",{style:{fontSize:"0.9rem",fontWeight:600,display:"block",marginBottom:"8px"},children:"Các đáp án thay thế (có thể chấp nhận):"}),e.jsx("div",{style:{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"8px"},children:(t.alternativeAnswers||[]).map((s,c)=>e.jsxs("span",{style:{background:"#e3f2fd",color:"#1565c0",padding:"4px 12px",borderRadius:"16px",fontWeight:600,display:"inline-flex",alignItems:"center",gap:"8px"},children:[s,e.jsx("span",{onClick:()=>{const b=[...t.alternativeAnswers||[]];b.splice(c,1),n(t.id,"alternativeAnswers",b)},style:{cursor:"pointer",opacity:.6},children:"×"})]},c))}),e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsx("input",{type:"text",value:A,onChange:s=>v(s.target.value),placeholder:"Thêm đáp án thay thế...",style:{padding:"6px 12px",borderRadius:"8px",border:"1px solid #ccc",flex:1},onKeyDown:s=>{if(s.key==="Enter"&&A.trim()){const c=[...t.alternativeAnswers||[]];c.includes(A.trim())||(c.push(A.trim()),n(t.id,"alternativeAnswers",c)),v("")}}}),e.jsx("button",{onClick:()=>{if(A.trim()){const s=[...t.alternativeAnswers||[]];s.includes(A.trim())||(s.push(A.trim()),n(t.id,"alternativeAnswers",s)),v("")}},style:{background:"transparent",color:"#1976d2",border:"1px solid #1976d2",padding:"6px 16px",borderRadius:"8px",fontWeight:600,cursor:"pointer"},children:"Thêm"})]})]})]})]}),p==="true_false"&&e.jsxs("div",{style:{marginTop:"16px"},children:[e.jsx("div",{style:{fontSize:"0.9rem",fontWeight:600,marginBottom:"8px"},children:"Các mệnh đề:"}),(t.statements||[]).map((s,c)=>e.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center",marginBottom:"8px"},children:[e.jsxs("div",{style:{fontWeight:600,width:"20px"},children:[String.fromCharCode(65+c),"."]}),e.jsx("div",{style:{flex:1},children:e.jsx(ve,{value:s.text,onChange:b=>R(c,"text",b),placeholder:`Nhập mệnh đề ${c+1}`,rows:1,size:"small",variant:"minimal"})}),e.jsxs("div",{style:{display:"flex",gap:"4px"},children:[e.jsx("button",{onClick:()=>R(c,"isTrue",!0),style:{padding:"4px 12px",borderRadius:"16px",fontWeight:600,border:"none",cursor:"pointer",background:s.isTrue?"#43a047":"#f5f5f5",color:s.isTrue?"#fff":"#666"},children:"Đúng"}),e.jsx("button",{onClick:()=>R(c,"isTrue",!1),style:{padding:"4px 12px",borderRadius:"16px",fontWeight:600,border:"none",cursor:"pointer",background:s.isTrue?"#f5f5f5":"#ef5350",color:s.isTrue?"#666":"#fff"},children:"Sai"})]})]},c))]}),(p==="abcd"||p==="multiple")&&e.jsxs("div",{style:{marginTop:"16px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"},children:[e.jsxs("div",{style:{fontSize:"0.9rem",fontWeight:600},children:["Các lựa chọn (",K.length,"/4)"]}),K.length<4&&e.jsx("button",{onClick:B,style:{background:"transparent",color:"#1976d2",border:"1px solid #1976d2",padding:"4px 12px",borderRadius:"8px",fontWeight:600,cursor:"pointer",fontSize:"0.8rem"},children:"+ Thêm đáp án"})]}),e.jsx("div",{className:"options-grid",style:{gridTemplateColumns:"1fr 1fr"},children:K.map((s,c)=>{const b=p==="abcd"?t.correct===c.toString():(t.correctIndices||[]).includes(c);return e.jsxs("div",{className:"option-wrapper",style:{border:b?`2px solid ${p==="abcd"?"#4caf50":"#7b1fa2"}`:void 0},children:[e.jsxs("div",{className:"option-header",children:[e.jsxs("div",{className:"option-label",children:[d("quizEntry.answer")," ",String.fromCharCode(65+c)]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[K.length>2&&e.jsx("button",{onClick:()=>O(c),style:{background:"none",border:"none",color:"#f44336",cursor:"pointer",fontSize:"1rem",padding:"0 4px"},title:"Xóa đáp án",children:"×"}),p==="abcd"?e.jsx("div",{className:`radio-circle ${b?"selected":""}`,onClick:()=>n(t.id,"correct",c.toString()),children:b&&e.jsx("span",{className:"checkmark",children:"✓"})}):e.jsx("input",{type:"checkbox",checked:b,onChange:S=>{const M=[...t.correctIndices||[]];if(S.target.checked)M.includes(c)||M.push(c);else{const N=M.indexOf(c);N>-1&&M.splice(N,1)}n(t.id,"correctIndices",M)},style:{width:"20px",height:"20px",cursor:"pointer"}})]})]}),e.jsx(ve,{value:s,onChange:S=>C(c,S),onImagePaste:S=>Z(c,S),placeholder:`${d("quizEntry.answer")} ${String.fromCharCode(65+c)}`,rows:1,size:"small",variant:"minimal",toolbar:e.jsx(Te,{value:X[c]||"",onChange:S=>j(c,S),compact:!0,storagePath:"interactive-video-images"})}),X[c]&&e.jsxs("div",{className:"option-img-preview",children:[e.jsx("img",{src:X[c],alt:`option ${c}`}),e.jsx("button",{className:"qe-remove-media",onClick:()=>j(c,""),children:"×"})]})]},c)})})]})]})}function Mt(t){if(!t)return null;const a=[/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/];for(const n of a){const l=t.match(n);if(l)return l[1]}return null}function Rt(){return new Promise(t=>{if(window.YT&&window.YT.Player){t();return}if(!document.getElementById("yt-iframe-api")){const l=document.createElement("script");l.id="yt-iframe-api",l.src="https://www.youtube.com/iframe_api",document.head.appendChild(l)}const n=setInterval(()=>{window.YT&&window.YT.Player&&(clearInterval(n),t())},100)})}function Ot(t,a){const n=o.useRef(null),[l,i]=o.useState(0),[d,m]=o.useState(0),[h,T]=o.useState(!1),[k,L]=o.useState(!1),q=o.useRef(null),I=Mt(a),w=o.useCallback(()=>{q.current&&clearInterval(q.current),q.current=setInterval(()=>{n.current&&typeof n.current.getCurrentTime=="function"&&i(n.current.getCurrentTime())},500)},[]),A=o.useCallback(()=>{q.current&&(clearInterval(q.current),q.current=null)},[]);o.useEffect(()=>{if(!I||!t)return;let p;return(async()=>{await Rt(),n.current&&typeof n.current.destroy=="function"&&(n.current.destroy(),n.current=null),T(!1),i(0),m(0),L(!1),p=new window.YT.Player(t,{videoId:I,playerVars:{rel:0,modestbranding:1,controls:1},events:{onReady:j=>{n.current=j.target,m(j.target.getDuration()),T(!0)},onStateChange:j=>{j.data===window.YT.PlayerState.PLAYING?(L(!0),w(),m(j.target.getDuration())):(L(!1),A(),j.target&&typeof j.target.getCurrentTime=="function"&&i(j.target.getCurrentTime()))}}})})(),()=>{if(A(),p&&typeof p.destroy=="function")try{p.destroy()}catch{}n.current=null}},[I,t,w,A]);const v=o.useCallback(p=>{n.current&&typeof n.current.seekTo=="function"&&(n.current.seekTo(p,!0),i(p))},[]),f=o.useCallback(()=>n.current&&typeof n.current.getCurrentTime=="function"?n.current.getCurrentTime():l,[l]);return{currentTime:l,duration:d,isReady:h,isPlaying:k,seekTo:v,getCurrentTime:f}}function G(t){const a=Math.floor(Number(t)||0),n=Math.floor(a/60),l=a%60;return`${String(n).padStart(2,"0")}:${String(l).padStart(2,"0")}`}function Ie(t=0){return{id:Date.now(),minutes:Math.floor(t/60).toString(),seconds:(t%60).toString(),question:"",questionImage:"",questionAudio:"",options:["","","",""],optionImages:["","","",""],correct:""}}function Ne(){return"lv_"+Date.now()+"_"+Math.random().toString(36).slice(2,9)}function Ht({quiz:t,index:a,onClick:n,onDelete:l}){const{t:i}=J("interactiveVideo"),d=parseInt(t.minutes||0)*60+parseInt(t.seconds||0);return e.jsxs("div",{className:"quiz-preview-card",onClick:n,children:[e.jsxs("div",{className:"qpc-header",children:[e.jsx("span",{className:"qpc-time",children:G(d)}),e.jsxs("span",{className:"qpc-label",children:[i("quizEntry.question")," ",a+1]}),e.jsx("button",{className:"qpc-delete",onClick:m=>{m.stopPropagation(),l(t.id)},children:"×"})]}),e.jsx("p",{className:"qpc-question",children:t.question?t.question.replace(/<[^>]*>/g,"").substring(0,80)+(t.question.length>80?"…":""):e.jsx("em",{className:"qpc-empty",children:i("quizEntry.noContent")})}),t.correct!==""&&e.jsxs("span",{className:"qpc-answered",children:["✓ ",i("quizEntry.answer")," ",String.fromCharCode(65+parseInt(t.correct))]})]})}function Vt({quiz:t,onSave:a,onClose:n,title:l,userId:i,toast:d}){const{t:m}=J("interactiveVideo"),[h,T]=o.useState("manual"),[k,L]=o.useState(()=>({...t,options:[...t.options]})),[q,I]=o.useState(!1),w=(v,f)=>{L(p=>{if(v==="option"){const C=[...p.options];return C[f.index]=f.text,{...p,options:C}}if(v==="optionImage"){const C=[...p.optionImages||["","","",""]];return C[f.index]=f.url,{...p,optionImages:C}}return{...p,[v]:f}})},A=v=>{if(I(!1),!(v!=null&&v.length))return{validCount:0};const f=v[0],p=f.type||"multiple_choice",C=f.question||f.questionText||"",j=f._source==="bank"?f.id:void 0;if(p==="true_false")L(B=>({...B,question:C,questionImage:f.questionImage||"",questionAudio:f.questionAudio||"",type:"true_false",statements:f.statements||[],options:["","","",""],optionImages:["","","",""],correct:"",fromQuestionBank:!0,questionBankId:j}));else if(p==="short_answer")L(B=>({...B,question:C,questionImage:f.questionImage||"",questionAudio:f.questionAudio||"",type:"short_answer",correctAnswer:f.correctAnswer||"",alternativeAnswers:f.alternativeAnswers||[],options:["","","",""],optionImages:["","","",""],correct:"",fromQuestionBank:!0,questionBankId:j}));else{const B=f.answers||[],O=B.map(x=>x.text),z=B.map(x=>x.image||""),R=B.findIndex(x=>x.isCorrect),H=B.filter(x=>x.isCorrect).length>1,W=O.length>=4?O:[...O,...Array(4-O.length).fill("")],_=z.length>=4?z:[...z,...Array(4-z.length).fill("")];L(x=>({...x,question:C,questionImage:f.questionImage||"",questionAudio:f.questionAudio||"",type:H?"multiple":void 0,options:W,optionImages:_,correct:H?"":R>=0?R.toString():"",...H&&{correctIndices:B.map((F,Z)=>F.isCorrect?Z:-1).filter(F=>F>=0)},fromQuestionBank:!0,questionBankId:j}))}return T("manual"),{validCount:1}};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"quiz-modal-overlay",onClick:n,children:e.jsxs("div",{className:"quiz-modal-box",onClick:v=>v.stopPropagation(),children:[e.jsxs("div",{className:"quiz-modal-header",children:[e.jsx("h3",{children:l}),e.jsxs("span",{className:"quiz-modal-time",children:["🕐 ",G(parseInt(k.minutes||0)*60+parseInt(k.seconds||0))]}),e.jsx("button",{className:"quiz-modal-close",onClick:n,children:"✕"})]}),e.jsxs("div",{className:"quiz-modal-tabs",children:[e.jsxs("button",{className:`qmt-btn${h==="manual"?" active":""}`,onClick:()=>T("manual"),children:["✏️ ",m("quizForm.modalManual")]}),e.jsxs("button",{className:`qmt-btn${h==="bank"?" active":""}`,onClick:()=>T("bank"),children:["🗃️ ",m("quizForm.modalBank")]})]}),h==="manual"?e.jsx("div",{className:"quiz-modal-body",children:e.jsx(_t,{quiz:k,index:0,onUpdate:(v,f,p)=>w(f,p),onDelete:()=>{},userId:i})}):e.jsxs("div",{className:"quiz-modal-bank-tab",children:[e.jsx("p",{className:"bank-hint",children:m("quizForm.modalBankHint")}),e.jsxs("button",{className:"bank-open-btn",onClick:()=>I(!0),children:["🗃️ ",m("quizForm.modalOpenBank")]})]}),e.jsxs("div",{className:"quiz-modal-footer",children:[e.jsx("button",{className:"qm-btn qm-cancel",onClick:n,children:m("quizForm.modalCancel")}),e.jsx("button",{className:"qm-btn qm-save",onClick:()=>a(k),children:m("quizForm.modalSave")})]})]})}),q&&e.jsx(gt,{open:q,onClose:()=>I(!1),onSelect:A,userId:i,multiSelect:!1,maxSelection:1,allowedTypes:ht,currentFeature:"interactive_video",title:m("quizForm.questionPickerTitle")})]})}function Pt({onStartVideo:t,editingLesson:a,toast:n,onSaveSuccess:l}){const{t:i}=J("interactiveVideo"),[d,m]=o.useState("youtube"),[h,T]=o.useState(""),[k,L]=o.useState(()=>Ne()),[q,I]=o.useState(null),[w,A]=o.useState(null),[v,f]=o.useState(!1),p=o.useRef(null),[C,j]=o.useState(""),[B,O]=o.useState(!1),[z,R]=o.useState([]),[H,W]=o.useState(!1),[_,x]=o.useState(null),[F,Z]=o.useState(!0),[X,K]=o.useState("md"),[s,c]=o.useState("md"),{currentUser:b}=Ee(),{subscription:S}=ze(),M=(()=>{const r=Le(S,"interactiveVideo");return{remaining:r.remaining,mode:r.level,currentCount:r.currentCount||0,limit:r.limit||5}})(),[N,U]=o.useState(null),re=o.useId().replace(/:/g,"_")+"_yt",{currentTime:he,duration:xe,isReady:oe,seekTo:ae,getCurrentTime:le}=Ot(d==="youtube"?re:null,d==="youtube"?h:""),u=o.useRef(null),[E,Q]=o.useState(0),[ee,te]=o.useState(0),ne=!!w&&ee>0,ie=d==="youtube"?he:E,D=d==="youtube"?xe:ee,He=d==="youtube"?oe:ne,ye=o.useCallback(r=>{d==="youtube"?ae(r):u.current&&(u.current.currentTime=r)},[d,ae]),we=o.useCallback(()=>{var r;return d==="youtube"?le():((r=u.current)==null?void 0:r.currentTime)??0},[d,le]);o.useEffect(()=>{if(a)if(j(a.title||""),x(a.id),Z(a.allowSeeking??!0),K(a.questionFontSize??"md"),c(a.answerFontSize??"md"),R(a.quizzes.map((r,g)=>{var P,V;return{id:Date.now()+g,minutes:Math.floor(r.time/60).toString(),seconds:(r.time%60).toString(),question:r.question,questionImage:r.questionImage||"",questionAudio:r.questionAudio||"",options:r.options,optionImages:r.optionImages||Array(((P=r.options)==null?void 0:P.length)||4).fill(""),correct:((V=r.correct)==null?void 0:V.toString())??"",type:r.type,statements:r.statements,correctAnswer:r.correctAnswer,alternativeAnswers:r.alternativeAnswers,correctIndices:r.correctIndices,fromQuestionBank:r.fromQuestionBank||!1,questionBankId:r.questionBankId||null}})),a.videoType==="local"){m("local");const r=a.localVideoKey||Ne();L(r),xt(r).then(g=>{g?A(g):f(!0)})}else m("youtube"),T(a.youtubeUrl||"")},[a]),o.useEffect(()=>()=>{w&&w.startsWith("blob:")&&URL.revokeObjectURL(w)},[w]);const Ve=o.useCallback(async r=>{var V;const g=(V=r.target.files)==null?void 0:V[0];if(!g)return;I(g),f(!1),w&&URL.revokeObjectURL(w);const P=URL.createObjectURL(g);A(P);try{await bt(k,g)}catch(Y){console.error("IndexedDB save failed:",Y),n.warning(i("quizForm.indexedDbFail"))}},[k,w,n]),Pe=o.useCallback(r=>{if(!D)return;const g=r.currentTarget.getBoundingClientRect();ye(Math.max(0,Math.min(D,(r.clientX-g.left)/g.width*D)))},[D,ye]),$e=o.useCallback(()=>{const r=Math.floor(we());U({quiz:Ie(r),mode:"add"})},[we]);o.useCallback(()=>U({quiz:Ie(0),mode:"add"}),[]);const De=o.useCallback(r=>{R(g=>(N.mode==="edit"?g.map(V=>V.id===r.id?r:V):[...g,r]).sort((V,Y)=>parseInt(V.minutes||0)*60+parseInt(V.seconds||0)-(parseInt(Y.minutes||0)*60+parseInt(Y.seconds||0)))),U(null)},[N]),We=o.useCallback(r=>{R(g=>g.length<=1?(n.warning(i("quizForm.minLessons")),g):g.filter(P=>P.id!==r))},[n]),ce=o.useCallback(()=>{var g,P,V,Y,je;if(d==="youtube"&&!h.trim())return n.error(i("quizForm.errorNoUrl")),null;if(d==="local"&&!w&&!v)return n.error(i("quizForm.errorNoFile")),null;const r={videoType:d,youtubeUrl:d==="youtube"?h:"",localVideoKey:d==="local"?k:null,quizzes:[],title:C.trim()||`Bài học ${M.currentCount+1}`,allowSeeking:F,questionFontSize:X,answerFontSize:s,startTime:0};for(const y of z){const be=y.type||void 0,$={time:parseInt(y.minutes||0)*60+parseInt(y.seconds||0),question:((g=y.question)==null?void 0:g.trim())||"",...y.questionImage&&{questionImage:y.questionImage},...y.questionAudio&&{questionAudio:y.questionAudio},...y.fromQuestionBank&&{fromQuestionBank:!0},...y.questionBankId&&{questionBankId:y.questionBankId}};if(!$.question)return n.error(i("quizForm.errorIncomplete")),null;if(be==="true_false"){if(!(((P=y.statements)==null?void 0:P.length)>=2))return n.error(i("quizForm.errorIncomplete")),null;$.type="true_false",$.statements=y.statements}else if(be==="short_answer"){if(!((V=y.correctAnswer)!=null&&V.trim()))return n.error(i("quizForm.errorIncomplete")),null;$.type="short_answer",$.correctAnswer=y.correctAnswer,$.alternativeAnswers=y.alternativeAnswers||[]}else if(be==="multiple"){if(!((Y=y.options)!=null&&Y.length)||!(((je=y.correctIndices)==null?void 0:je.length)>=2))return n.error(i("quizForm.errorIncomplete")),null;$.type="multiple",$.options=y.options.map(de=>(de||"").trim()),$.correctIndices=y.correctIndices}else{if(!y.options||y.options.some((se,Xe)=>{var ke;return!(se||"").trim()&&!((ke=y.optionImages)!=null&&ke[Xe])})||y.correct==="")return n.error(i("quizForm.errorIncomplete")),null;$.options=y.options.map(se=>(se||"").trim()),$.correct=parseInt(y.correct);const de=y.optionImages||[];de.some(se=>se)&&($.optionImages=de)}r.quizzes.push($)}return r},[d,h,w,v,k,C,F,X,s,z,n,M.currentCount]),Qe=o.useCallback(async()=>{const r=ce();if(r)try{W(!0);let g=_;if(_)await rt(_,r),n.success(i("quizForm.updateSuccess")),l&&l();else{const P=await ot(r,b.uid);g=P.id,x(P.id),n.success(i("quizForm.saveSuccess"))}}catch(g){if((g==null?void 0:g.message)==="LIMIT_REACHED"){n.warning("Bạn đã hết lượt tạo Video tương tác. Vui lòng nâng cấp để tạo thêm.");return}n.error(i("quizForm.saveFail"))}finally{W(!1)}},[ce,_,b,n,z,C]);o.useCallback(()=>{if(!_){n.warning(i("quizForm.saveLinkFirst"));return}navigator.clipboard.writeText(`${window.location.origin}/play/${_}`),n.success(i("quizForm.copiedLink"))},[_,n]),o.useCallback(()=>{const r=ce();r&&t(r)},[ce,t]);const Ze=D>0?ie/D*100:0;return e.jsxs("div",{className:"quiz-form-iv studio-layout",children:[e.jsxs("div",{className:"studio-left",children:[e.jsx("div",{className:"studio-title-row",children:B?e.jsx("input",{className:"lesson-title-input",type:"text",value:C,onChange:r=>j(r.target.value),onBlur:()=>O(!1),onKeyDown:r=>r.key==="Enter"&&O(!1),autoFocus:!0,placeholder:i("quizForm.titlePlaceholder")}):e.jsxs("div",{className:"lesson-title-display",onClick:()=>O(!0),children:[e.jsx("span",{className:"lesson-title-text",children:C||i("quizForm.noTitle")}),e.jsx("span",{className:"edit-icon",children:"✏️"})]})}),e.jsxs("div",{className:"video-source-row",children:[e.jsxs("div",{className:"video-type-tabs",children:[e.jsx("button",{className:`vt-tab${d==="youtube"?" active":""}`,onClick:()=>m("youtube"),title:i("quizForm.youtubeHint"),children:"🔗"}),e.jsx("button",{className:`vt-tab${d==="local"?" active":""}`,onClick:()=>m("local"),title:i("quizForm.localHint"),children:"📁"})]}),d==="youtube"?e.jsx("input",{className:"youtube-url-input-iv",type:"text",placeholder:i("quizForm.youtubeUrlPlaceholder"),value:h,onChange:r=>T(r.target.value)}):e.jsx("div",{className:"local-mode-hint",children:i("quizForm.localModeHint")})]}),d==="local"&&e.jsxs("div",{className:"local-upload-zone",onClick:()=>{var r;return(r=p.current)==null?void 0:r.click()},children:[w?e.jsxs("div",{className:"local-upload-ready",children:[e.jsx("span",{className:"local-upload-icon",children:"✅"}),e.jsx("span",{children:(q==null?void 0:q.name)||i("quizForm.localReady")}),e.jsx("button",{className:"local-change-btn",onClick:r=>{var g;r.stopPropagation(),(g=p.current)==null||g.click()},children:i("quizForm.localChangeFile")})]}):v?e.jsxs("div",{className:"local-upload-missing",children:[e.jsx("span",{children:"⚠️"}),e.jsx("span",{style:{whiteSpace:"pre-line"},children:i("quizForm.localMissing")})]}):e.jsxs("div",{className:"local-upload-prompt",children:[e.jsx("span",{className:"local-upload-icon",children:"📁"}),e.jsxs("span",{children:[i("quizForm.localPrompt"),e.jsx("br",{}),e.jsx("small",{children:i("quizForm.localPromptSub")})]})]}),e.jsx("input",{ref:p,type:"file",accept:"video/*",hidden:!0,onChange:Ve})]}),d==="local"&&e.jsxs("div",{className:"local-info-banner",children:["ℹ️ ",i("quizForm.localInfoBanner")]}),e.jsx("div",{className:"video-preview-wrapper",children:d==="youtube"?h?e.jsx("div",{style:{width:"100%",height:"100%"},children:e.jsx("div",{id:re,className:"yt-player-container"})},"yt-wrapper"):e.jsxs("div",{className:"video-placeholder",children:[e.jsx("div",{className:"video-placeholder-icon",children:"🎬"}),e.jsx("p",{children:i("quizForm.ytPlaceholder")})]},"yt-placeholder"):w?e.jsx("video",{ref:u,src:w,className:"local-video-preview",controls:!0,onTimeUpdate:r=>Q(r.target.currentTime),onLoadedMetadata:r=>te(r.target.duration)},"local-video"):e.jsxs("div",{className:"video-placeholder",children:[e.jsx("div",{className:"video-placeholder-icon",children:"📁"}),e.jsx("p",{children:i("quizForm.localPlaceholder")})]},"local-placeholder")}),e.jsxs("div",{className:"timeline-section",children:[e.jsxs("div",{className:`timeline-track${D>0?" clickable":""}`,onClick:Pe,children:[e.jsx("div",{className:"timeline-progress",style:{width:`${Ze}%`}}),D>0&&z.map(r=>{const g=parseInt(r.minutes||0)*60+parseInt(r.seconds||0);return e.jsx("div",{className:"timeline-marker",style:{left:`${g/D*100}%`},title:`Câu hỏi tại ${G(g)}`},r.id)})]}),e.jsxs("div",{className:"timeline-times",children:[e.jsx("span",{className:"time-current",children:G(ie)}),e.jsx("span",{className:"time-divider",children:"/"}),e.jsx("span",{className:"time-total",children:D>0?G(D):"--:--"}),d==="youtube"&&!oe&&h&&e.jsxs("span",{className:"player-status",children:["⏳ ",i("quizForm.playerLoading")]})]})]}),e.jsxs("div",{className:"btn-add-save-row",children:[e.jsxs("button",{className:"btn-add-at-time",onClick:$e,disabled:!He,children:["➕ ",i("quizForm.addAtTime")," ",G(ie)]}),e.jsxs("button",{className:"btn-save-inline",onClick:Qe,disabled:H,children:[H?"⏳":"💾"," ",i(H?"sidebar.saving":_?"sidebar.update":"sidebar.saveLesson")]}),e.jsxs("label",{className:"btn-seeking-toggle",title:i("sidebar.allowSeeking"),children:[e.jsx("span",{className:"seeking-label",children:i("sidebar.allowSeeking")}),e.jsx("input",{type:"checkbox",checked:F,onChange:r=>Z(r.target.checked)}),e.jsx("span",{className:"slider-iv round-iv"})]})]})]}),e.jsxs("div",{className:"studio-right",children:[e.jsxs("div",{className:"studio-right-header",children:[e.jsxs("h3",{className:"questions-panel-title",children:[i("quizForm.panelTitle"),z.length>0&&e.jsx("span",{className:"questions-count-badge",children:z.length})]}),e.jsxs("div",{className:"qf-fontsize-row",children:[e.jsxs("label",{className:"qf-fontsize-label",children:["🔡 Cỡ chữ câu hỏi:",e.jsxs("select",{className:"qf-fontsize-select",value:X,onChange:r=>K(r.target.value),children:[e.jsx("option",{value:"sm",children:"Bé"}),e.jsx("option",{value:"md",children:"Chuẩn"}),e.jsx("option",{value:"lg",children:"Lớn"}),e.jsx("option",{value:"xl",children:"Rất lớn"})]})]}),e.jsxs("label",{className:"qf-fontsize-label",children:["🔠 Cỡ chữ đáp án:",e.jsxs("select",{className:"qf-fontsize-select",value:s,onChange:r=>c(r.target.value),children:[e.jsx("option",{value:"sm",children:"Bé"}),e.jsx("option",{value:"md",children:"Chuẩn"}),e.jsx("option",{value:"lg",children:"Lớn"}),e.jsx("option",{value:"xl",children:"Rất lớn"})]})]})]})]}),e.jsx("div",{className:"quiz-preview-list",children:z.length===0?e.jsxs("div",{className:"empty-questions",children:[e.jsx("div",{className:"empty-icon",children:"🎯"}),e.jsx("p",{children:i("quizForm.noQuestions")}),e.jsx("p",{className:"empty-hint",children:i("quizForm.noQuestionsHint")})]}):z.map((r,g)=>e.jsx(Ht,{quiz:r,index:g,onClick:()=>U({quiz:r,mode:"edit"}),onDelete:We},r.id))})]}),N&&e.jsx(Vt,{quiz:N.quiz,title:N.mode==="add"?i("quizForm.modalAddTitle"):`✏️ ${i("quizForm.modalEditTitle")}`,onSave:De,onClose:()=>U(null),userId:b==null?void 0:b.uid,toast:n})]})}const pe=(t,a,n,l,i)=>({time:t,question:a,questionImage:i??"",type:"abcd",options:n,correct:l}),Ae={id:"__demo__",title:"Video Tương Tác - Bản Chạy Thử",videoType:"youtube",youtubeUrl:"https://youtu.be/3WOJ90gB8oA?si=1mBUgXHvtM0Ju_77",localVideoKey:null,allowSeeking:!0,questionFontSize:"md",answerFontSize:"md",startTime:0,quizzes:[pe(5,"Thủ đô của Việt Nam là thành phố nào?",["Hà Nội","TP. Hồ Chí Minh","Đà Nẵng","Huế"],0),pe(10,"Núi nào cao nhất Việt Nam?",["Fansipan","Ngọc Linh","Bạch Mã","Langbiang"],0),pe(15,"Tính diện tích hình tròn bán kính $r = 5$ cm?",["$25\\pi$ cm²","$10\\pi$ cm²","$5\\pi$ cm²","$50\\pi$ cm²"],0),pe(20,"Đây là quốc kỳ của quốc gia nào?",["Việt Nam","Trung Quốc","Nhật Bản","Hàn Quốc"],0,"https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1280px-Flag_of_Vietnam.svg.png")]};function Me(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const $t=/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([0-9.,\s%]+\))$/i;function Re(t){return Nt(t).map(a=>{if(a.type==="formula")return`<span class="math-inline">${ct.renderToString(a.content,{throwOnError:!1,displayMode:!1,output:"html"})}</span>`;if(a.type==="color"){const n=Re(a.content),l=(a.color??"").trim();return $t.test(l)?`<span style="color:${l}">${n}</span>`:n}return Me(a.content)}).join("")}function Dt(t){return Re(qt(It(String(t??""))))}async function Wt(t){let a=!1;const n=m=>{const h=Dt(m);return h.includes('class="math-inline"')&&(a=!0),h},l=(t.quizzes??[]).map(m=>({...m,questionHtml:n(m.question),optionsHtml:(m.options??[]).map(n),statements:(m.statements??[]).map(h=>({...h,textHtml:n(h.text)}))})),i=JSON.stringify({quizzes:l,allowSeeking:t.allowSeeking,questionFontSize:t.questionFontSize,answerFontSize:t.answerFontSize}).replace(/</g,"\\u003c"),d=a?(await _e(async()=>{const{KATEX_FONTS_CSS:m}=await import("./katexFontsCss-azTnKuYB.js");return{KATEX_FONTS_CSS:m}},[])).KATEX_FONTS_CSS+`
.math-inline{display:inline-block;margin:0 2px;padding:2px 4px;background:rgba(102,126,234,.15);border-radius:4px;vertical-align:middle}`:"";return{quizJson:i,katexCss:d}}function Oe(t){return t.replace(/[^a-zA-Z0-9À-ỹ _-]/g,"").trim().slice(0,60)||"video-tuong-tac"}function Qt(t){return`
<script>
var QUIZ_DATA = ${t};

var quizzes        = QUIZ_DATA.quizzes || [];
var allowSeeking   = QUIZ_DATA.allowSeeking !== false;
var questionFs     = { sm:'1rem', md:'1.25rem', lg:'1.6rem', xl:'2rem' }[QUIZ_DATA.questionFontSize] || '1.25rem';
var answerFs       = { sm:'1rem', md:'1.25rem', lg:'1.6rem', xl:'2rem' }[QUIZ_DATA.answerFontSize]   || '1.25rem';

var currentIdx        = -1;
var incorrectSet      = [];
var answered          = false;
var triggeredWindows  = new Set();
var tickInterval      = null;
var selectedMultiple  = [];
var tfState           = {};

function escapeHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// ── Sound effects (base64 short beeps) ──────────────────────────────────────
var CTX = null;
function getCtx() { if (!CTX) { try { CTX = new (window.AudioContext||window.webkitAudioContext)() } catch(e){} } return CTX }
function playBeep(freq, type, dur, vol) {
  var ctx = getCtx(); if (!ctx) return;
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = type||'sine'; o.frequency.value = freq||440;
  g.gain.setValueAtTime(vol||0.3, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.start(); o.stop(ctx.currentTime + dur);
}
function playCorrect()   { playBeep(880,'sine',0.3,0.3); setTimeout(function(){ playBeep(1100,'sine',0.25,0.2) },150) }
function playIncorrect() { playBeep(220,'sawtooth',0.4,0.25) }

// ── Overlay render ───────────────────────────────────────────────────────────
function showOverlay(idx) {
  currentIdx       = idx;
  incorrectSet     = [];
  answered         = false;
  selectedMultiple = [];
  tfState          = {};
  var q = quizzes[idx];
  var overlay = document.getElementById('quiz-overlay');
  overlay.innerHTML = buildOverlayHTML(q, idx);
  overlay.style.display = 'flex';
  bindOverlayEvents(q);
}

function buildOverlayHTML(q, idx) {
  var qType = q.type || 'abcd';
  var labels = ['A','B','C','D','E','F'];
  var typeLabel = qType === 'true_false' ? '✅ Đúng/Sai' : qType === 'short_answer' ? '✏️ Trả lời ngắn' : qType === 'multiple' ? '☑️ Nhiều đáp án' : '';

  var answersHtml = '';
  if (qType === 'abcd') {
    (q.options||[]).forEach(function(opt, i) {
      var img = q.optionImages && q.optionImages[i] ? '<img src="'+escapeHtml(q.optionImages[i])+'" style="display:block;max-width:100%;max-height:80px;border-radius:4px;margin-bottom:'+(opt?'4px':'0')+';object-fit:contain">' : '';
      answersHtml += '<button class="ans-btn" data-idx="'+i+'" style="font-size:'+answerFs+'"><span class="ans-label">'+labels[i]+'</span><span class="ans-text">'+img+(opt?q.optionsHtml[i]:'')+'</span></button>';
    });
  } else if (qType === 'multiple') {
    (q.options||[]).forEach(function(opt, i) {
      var img = q.optionImages && q.optionImages[i] ? '<img src="'+escapeHtml(q.optionImages[i])+'" style="display:block;max-width:100%;max-height:80px;border-radius:4px;margin-bottom:'+(opt?'4px':'0')+';object-fit:contain">' : '';
      answersHtml += '<button class="ans-btn" data-multi="'+i+'" style="font-size:'+answerFs+'"><span class="ans-label">'+labels[i]+'</span><span class="ans-text">'+img+(opt?q.optionsHtml[i]:'')+'</span></button>';
    });
    answersHtml += '<button class="ans-confirm" id="confirm-multi" style="grid-column:span 2;font-size:'+answerFs+'">Xác nhận</button>';
  } else if (qType === 'true_false') {
    (q.statements||[]).forEach(function(st, i) {
      answersHtml += '<div class="tf-row"><div class="tf-text"><b>'+labels[i]+'.</b> '+st.textHtml+'</div>'
        +'<div class="tf-btns"><button class="tf-btn" data-tf="'+i+'" data-val="true">Đúng</button>'
        +'<button class="tf-btn" data-tf="'+i+'" data-val="false">Sai</button></div></div>';
    });
  } else if (qType === 'short_answer') {
    answersHtml = '<div class="short-wrap"><input id="short-input" type="text" placeholder="Nhập câu trả lời..." style="font-size:'+answerFs+'">'
      +'<button class="ans-confirm" id="confirm-short" style="font-size:'+answerFs+'">Xác nhận</button></div>';
  }

  var audioBtn = q.questionAudio ? '<button class="rewind-btn" id="play-audio-btn">🔊 Phát âm</button>' : '<button class="rewind-btn" style="visibility:hidden">⏪ Tua lại</button>';
  var qImg = q.questionImage ? '<div class="q-img"><img src="'+escapeHtml(q.questionImage)+'" alt="question"></div>' : '';
  var audioEl = q.questionAudio ? '<audio id="q-audio" src="'+escapeHtml(q.questionAudio)+'"></audio>' : '';

  return '<div class="quiz-content">'
    +'<div class="quiz-header">'
    +'<button class="rewind-btn" id="rewind-btn">⏪ Tua lại</button>'
    +'<div class="quiz-header-center"><span class="q-badge">Câu '+(idx+1)+'</span>'+(typeLabel?'<span style="font-size:0.8em;opacity:0.7">'+typeLabel+'</span>':'')+'</div>'
    +audioBtn
    +'</div>'
    +'<h2 class="q-text" style="font-size:'+questionFs+'">'+q.questionHtml+'</h2>'
    +qImg
    +audioEl
    +'<div class="answers-wrap'+(qType==='true_false'||qType==='short_answer'?' single-col':'')+'" style="--ans-fs:'+answerFs+'">'+answersHtml+'</div>'
    +'<div class="feedback" id="feedback"></div>'
    +'</div>';
}

function bindOverlayEvents(q) {
  var qType = q.type || 'abcd';
  var rewindBtn = document.getElementById('rewind-btn');
  if (rewindBtn) rewindBtn.addEventListener('click', doRewind);

  var audioBtn = document.getElementById('play-audio-btn');
  var audioEl  = document.getElementById('q-audio');
  if (audioBtn && audioEl) {
    audioBtn.addEventListener('click', function() {
      if (audioEl.paused) { audioEl.play(); audioBtn.textContent = '⏹ Dừng' }
      else { audioEl.pause(); audioEl.currentTime=0; audioBtn.textContent = '🔊 Phát âm' }
    });
    audioEl.addEventListener('ended', function() { audioBtn.textContent = '🔊 Phát âm' });
  }

  if (qType === 'abcd') {
    document.querySelectorAll('.ans-btn[data-idx]').forEach(function(btn) {
      btn.addEventListener('click', function() { handleAbcd(parseInt(btn.dataset.idx), q) });
    });
  } else if (qType === 'multiple') {
    document.querySelectorAll('.ans-btn[data-multi]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (answered) return;
        var i = parseInt(btn.dataset.multi);
        var pos = selectedMultiple.indexOf(i);
        if (pos >= 0) { selectedMultiple.splice(pos,1); btn.classList.remove('selected') }
        else { selectedMultiple.push(i); btn.classList.add('selected') }
      });
    });
    var confirmBtn = document.getElementById('confirm-multi');
    if (confirmBtn) confirmBtn.addEventListener('click', function() { handleMultiple(q) });
  } else if (qType === 'true_false') {
    document.querySelectorAll('.tf-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (answered) return;
        var stIdx = parseInt(btn.dataset.tf);
        var val   = btn.dataset.val === 'true';
        tfState[stIdx] = val;
        // highlight row
        var row = btn.closest('.tf-row');
        row.querySelectorAll('.tf-btn').forEach(function(b) { b.classList.remove('tf-selected-t','tf-selected-f') });
        btn.classList.add(val ? 'tf-selected-t' : 'tf-selected-f');
        if (Object.keys(tfState).length >= (q.statements||[]).length) handleTrueFalse(q);
      });
    });
  } else if (qType === 'short_answer') {
    var inp = document.getElementById('short-input');
    var confirmS = document.getElementById('confirm-short');
    if (inp) inp.addEventListener('keydown', function(e) { if (e.key==='Enter') handleShort(q) });
    if (confirmS) confirmS.addEventListener('click', function() { handleShort(q) });
  }
}

function handleAbcd(i, q) {
  if (answered) return;
  if (incorrectSet.includes(i)) return;
  if (i === q.correct) {
    playCorrect();
    setFeedback('correct');
    answered = true;
    markCorrectBtn(i);
    setTimeout(closeOverlayAndResume, 1500);
  } else {
    playIncorrect();
    incorrectSet.push(i);
    var btn = document.querySelector('.ans-btn[data-idx="'+i+'"]');
    if (btn) { btn.classList.add('incorrect'); setTimeout(function(){ btn.classList.remove('incorrect') }, 1200) }
    setFeedback('incorrect');
    setTimeout(function(){ setFeedback('') }, 1500);
  }
}

function handleMultiple(q) {
  if (answered) return;
  var correct = q.correctIndices || [];
  var ok = selectedMultiple.length === correct.length && selectedMultiple.every(function(x){ return correct.includes(x) });
  if (ok) {
    playCorrect(); setFeedback('correct'); answered = true;
    setTimeout(closeOverlayAndResume, 1500);
  } else {
    playIncorrect(); setFeedback('incorrect');
    selectedMultiple = [];
    document.querySelectorAll('.ans-btn[data-multi]').forEach(function(b){ b.classList.remove('selected') });
    setTimeout(function(){ setFeedback('') }, 1500);
  }
}

function handleTrueFalse(q) {
  var ok = (q.statements||[]).every(function(st,i){ return tfState[i] === st.isTrue });
  if (ok) {
    playCorrect(); setFeedback('correct'); answered = true;
    setTimeout(closeOverlayAndResume, 1500);
  } else {
    playIncorrect(); setFeedback('incorrect');
    tfState = {};
    document.querySelectorAll('.tf-btn').forEach(function(b){ b.classList.remove('tf-selected-t','tf-selected-f') });
    setTimeout(function(){ setFeedback('') }, 1500);
  }
}

function handleShort(q) {
  if (answered) return;
  var inp = document.getElementById('short-input');
  if (!inp || !inp.value.trim()) return;
  var userAns = inp.value.trim().toLowerCase();
  var correct = (q.correctAnswer||'').trim().toLowerCase();
  var alts = (q.alternativeAnswers||[]).map(function(a){ return a.trim().toLowerCase() });
  if (userAns === correct || alts.includes(userAns)) {
    playCorrect(); setFeedback('correct'); answered = true;
    setTimeout(closeOverlayAndResume, 1500);
  } else {
    playIncorrect(); setFeedback('incorrect');
    inp.value = '';
    setTimeout(function(){ setFeedback('') }, 1500);
  }
}

function setFeedback(state) {
  var el = document.getElementById('feedback');
  if (!el) return;
  if (!state) { el.style.display='none'; return; }
  el.className = 'feedback ' + state;
  el.innerHTML = state === 'correct' ? '<span>🎉</span><span>Chính xác!</span>' : '<span>💭</span><span>Thử lại nhé!</span>';
  el.style.display = 'flex';
}

function markCorrectBtn(i) {
  var btn = document.querySelector('.ans-btn[data-idx="'+i+'"]');
  if (btn) btn.classList.add('correct');
}

function closeOverlayAndResume() {
  document.getElementById('quiz-overlay').style.display = 'none';
  resumeVideo();
}

function doRewind() {
  document.getElementById('quiz-overlay').style.display = 'none';
  triggeredWindows.clear();
  rewindVideo(10);
  resumeVideo();
}
<\/script>`}function Zt(){return`
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:#111;color:#fff;height:100dvh;display:flex;flex-direction:column;overflow:hidden}
  #title-bar{padding:10px 16px;background:#1a1a2e;font-size:1rem;font-weight:700;color:#e0c3fc;letter-spacing:.5px;flex-shrink:0}
  #video-wrap{position:relative;flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden}
  #rewind-icon{position:absolute;bottom:12px;left:12px;z-index:10;background:rgba(0,0,0,.55);border:none;color:#fff;font-size:1.4rem;border-radius:8px;padding:6px 10px;cursor:pointer}
  #quiz-overlay{display:none;position:absolute;inset:0;z-index:20;background:rgba(0,0,0,.75);align-items:center;justify-content:center;padding:12px}
  .quiz-content{background:#1e1e3f;border-radius:16px;padding:20px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.6)}
  .quiz-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:8px}
  .quiz-header-center{display:flex;flex-direction:column;align-items:center;gap:4px}
  .q-badge{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:700;font-size:.9rem;padding:4px 14px;border-radius:20px}
  .rewind-btn{background:rgba(255,255,255,.12);border:none;color:#fff;padding:7px 12px;border-radius:8px;cursor:pointer;font-size:.85rem;white-space:nowrap}
  .rewind-btn:hover{background:rgba(255,255,255,.22)}
  .q-text{color:#fff;font-weight:600;margin-bottom:14px;line-height:1.5}
  .q-img{margin-bottom:12px;text-align:center} .q-img img{max-width:100%;max-height:200px;border-radius:8px;object-fit:contain}
  .answers-wrap{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .answers-wrap.single-col{grid-template-columns:1fr}
  .ans-btn{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:10px 14px;cursor:pointer;text-align:left;transition:all .15s;font-size:var(--ans-fs,1.1rem)}
  .ans-btn:hover:not(:disabled){background:rgba(102,126,234,.25);border-color:#667eea}
  .ans-btn.correct{background:rgba(67,160,71,.3);border-color:#43a047;color:#a5d6a7}
  .ans-btn.incorrect{background:rgba(239,83,80,.25);border-color:#ef5350;color:#ef9a9a}
  .ans-btn.disabled,.ans-btn:disabled{opacity:.45;cursor:not-allowed}
  .ans-btn.selected{border-color:#7b1fa2;background:rgba(123,31,162,.2)}
  .ans-confirm{background:#7b1fa2;color:#fff;border:none;border-radius:10px;padding:12px;cursor:pointer;font-weight:700;font-size:1rem}
  .ans-confirm:disabled{opacity:.4;cursor:not-allowed}
  .ans-label{font-weight:700;font-size:1.1em;background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px;min-width:28px;text-align:center;flex-shrink:0}
  .ans-text{flex:1}
  .tf-row{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:12px;margin-bottom:8px}
  .tf-text{font-weight:600;margin-bottom:8px;line-height:1.4}
  .tf-btns{display:flex;gap:8px}
  .tf-btn{flex:1;padding:8px;border-radius:8px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:.9rem;font-weight:600}
  .tf-btn:hover{background:rgba(255,255,255,.15)}
  .tf-selected-t{background:rgba(67,160,71,.3)!important;border-color:#43a047!important;color:#a5d6a7!important}
  .tf-selected-f{background:rgba(239,83,80,.25)!important;border-color:#ef5350!important;color:#ef9a9a!important}
  .short-wrap{display:flex;flex-direction:column;gap:8px}
  #short-input{width:100%;padding:12px 16px;border-radius:8px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font-size:1rem;text-align:center;outline:none}
  #short-input:focus{border-color:#667eea}
  .feedback{display:none;align-items:center;justify-content:center;gap:8px;margin-top:14px;font-size:1.1rem;font-weight:700;padding:10px;border-radius:10px}
  .feedback.correct{background:rgba(67,160,71,.25);color:#a5d6a7}
  .feedback.incorrect{background:rgba(239,83,80,.2);color:#ef9a9a}
  `}async function Xt(t){const a=Me(t.title||"Video tương tác"),n=t.allowSeeking?"controls":"",{quizJson:l,katexCss:i}=await Wt(t);return`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${a}</title>
<style>
${Zt()}
${i}
#local-video{width:100%;height:100%;object-fit:contain;background:#000}
#missing-box{
  display:none;position:absolute;inset:0;z-index:5;
  flex-direction:column;align-items:center;justify-content:center;
  gap:16px;padding:24px;text-align:center;color:#fff;
  background:linear-gradient(135deg,#1a0a0a,#2d1515,#1a0a0a);
}
#missing-box .err-icon{font-size:3.5rem}
#missing-box h2{color:#ffcc80;font-size:1.3rem;font-weight:700;margin:0}
#missing-box p{color:#b0bec5;max-width:420px;line-height:1.7;font-size:.9rem;margin:0}
#missing-box code{background:rgba(255,255,255,.12);padding:2px 7px;border-radius:4px;font-family:monospace;color:#e0c3fc}
#start-overlay{position:absolute;inset:0;z-index:15;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,.45);cursor:pointer;gap:14px}
.play-btn{width:80px;height:80px;background:rgba(255,255,255,.92);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.2rem;color:#1a1a2e;box-shadow:0 4px 24px rgba(0,0,0,.5);transition:transform .15s,box-shadow .15s}
#start-overlay:hover .play-btn{transform:scale(1.1);box-shadow:0 8px 32px rgba(0,0,0,.7)}
.start-hint{color:#fff;font-size:1rem;text-shadow:0 1px 4px rgba(0,0,0,.8)}
</style>
</head>
<body>
<div id="title-bar">🎬 ${a}</div>
<div id="video-wrap">
  <video id="local-video" ${n} playsinline preload="metadata"></video>

  <div id="missing-box">
    <div class="err-icon">⚠️</div>
    <h2>Chưa tìm thấy file video</h2>
    <p>
      Đặt file video vào <b>cùng thư mục</b> với file <code>video.html</code><br>
      và đổi tên thành <code>src.mp4</code><br><br>
      Sau đó mở lại file <code>video.html</code>.
    </p>
    <p>Xem file <code>Hướng dẫn.txt</code> để biết thêm chi tiết.</p>
  </div>

  <div id="start-overlay" style="display:none">
    <div class="play-btn">▶</div>
    <p class="start-hint">Bấm để bắt đầu xem video</p>
  </div>

  <button id="rewind-icon" title="Tua lại 10 giây">⏪</button>
  <div id="quiz-overlay"></div>
</div>

${Qt(l)}

<script>
var vid = document.getElementById('local-video');
var missingBox   = document.getElementById('missing-box');
var startOverlay = document.getElementById('start-overlay');

vid.src = 'src.mp4';
vid.load();

vid.addEventListener('error', function() {
  vid.style.display = 'none';
  missingBox.style.display = 'flex';
  document.getElementById('rewind-icon').style.display = 'none';
});
vid.addEventListener('loadedmetadata', function() {
  missingBox.style.display = 'none';
  startOverlay.style.display = 'flex';
});

startOverlay.addEventListener('click', function() {
  startOverlay.style.display = 'none';
  vid.play();
});

vid.addEventListener('play', function() {
  startOverlay.style.display = 'none';
  startTick();
});
vid.addEventListener('pause', function() { stopTick(); });

function resumeVideo()  { vid.play(); }
function rewindVideo(s) { vid.currentTime = Math.max(0, vid.currentTime - s); }

function startTick() {
  stopTick();
  tickInterval = setInterval(function() {
    if (document.getElementById('quiz-overlay').style.display === 'flex') return;
    checkQuizAt(vid.currentTime);
  }, 100);
}
function stopTick() { if (tickInterval) { clearInterval(tickInterval); tickInterval = null; } }

function checkQuizAt(t) {
  for (var i = 0; i < quizzes.length; i++) {
    var qt = quizzes[i].time;
    if (t >= qt && t < qt + 1) {
      if (!triggeredWindows.has(i)) {
        triggeredWindows.add(i);
        vid.pause();
        stopTick();
        showOverlay(i);
        return;
      }
    } else {
      triggeredWindows.delete(i);
    }
  }
}

document.getElementById('rewind-icon').addEventListener('click', function() {
  document.getElementById('quiz-overlay').style.display = 'none';
  triggeredWindows.clear();
  rewindVideo(10);
  resumeVideo();
});
<\/script>
</body>
</html>`}function Kt(t){const a=t.title||"Video tương tác";return`CẤU TRÚC THƯ MỤC
==================
${Oe(a)}/
├── video.html        ← Mở file này bằng trình duyệt
├── src.mp4           ← ĐẶT FILE VIDEO CỦA BẠN VÀO ĐÂY (cùng thư mục!)
└── Hướng dẫn.txt    ← File này

CÁCH SỬ DỤNG
============
1. Copy file video của bạn vào CÙNG THƯ MỤC với video.html
   rồi đổi tên thành: src.mp4

   Ví dụ: "bai-giang-lop-9.mp4" → đổi thành → "src.mp4"
   Chú ý: Chỉ đổi tên file, KHÔNG đổi đuôi .mp4!

2. Mở file "video.html" bằng Chrome hoặc Edge.

3. Video phát ngay! Câu hỏi sẽ tự xuất hiện đúng giờ.

LƯU Ý
======
- Chạy HOÀN TOÀN OFFLINE, không cần internet.
- src.mp4 phải đặt CÙNG THƯ MỤC với video.html (không phải trong subfolder).
- Không xoá hay di chuyển file video.html.
- Firefox có thể bị hạn chế với file:// — nên dùng Chrome/Edge.
`}async function Ut(t){const a=(await _e(async()=>{const{default:T}=await import("./jszip.min-BXVbx_Ig.js").then(k=>k.j);return{default:T}},__vite__mapDeps([0,1]))).default,n=new a,l=Oe(t.title),i=n.folder(l);i.file("video.html",await Xt(t)),i.file("Hướng dẫn.txt",Kt(t));const d=await n.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}}),m=URL.createObjectURL(d),h=document.createElement("a");h.href=m,h.download=l+".zip",h.click(),URL.revokeObjectURL(m)}function Yt({open:t,onClose:a,lesson:n,toast:l}){const[i,d]=o.useState(!1),m=()=>{i||a()},h=async()=>{if(n){d(!0);try{await Ut(n),l==null||l.success("Đã tải xuống file ZIP!"),m()}catch(T){console.error("Export error:",T),l==null||l.error("Xuất file thất bại, vui lòng thử lại.")}finally{d(!1)}}};return e.jsxs(Ue,{open:t,onClose:m,maxWidth:"xs",fullWidth:!0,children:[e.jsxs(Ye,{sx:{fontWeight:700,pb:1},children:["📥 Tải xuống bài học",n&&e.jsxs(Ce,{variant:"body2",color:"text.secondary",sx:{mt:.5},children:['"',n.title,'"']})]}),e.jsx(Ge,{children:e.jsxs(ge,{sx:{border:"1px solid",borderColor:"divider",borderRadius:2,p:2},children:[e.jsxs(ge,{sx:{display:"flex",alignItems:"center",gap:1,mb:1},children:[e.jsx(qe,{sx:{color:"#43a047"}}),e.jsx(Ce,{fontWeight:700,children:"Offline ZIP"})]}),e.jsxs(Je,{severity:"success",sx:{fontSize:"0.82rem",mb:1.5},children:["Tải về 1 file ",e.jsx("b",{children:".zip"})," gồm ",e.jsx("b",{children:"video.html"})," + ",e.jsx("b",{children:"Hướng dẫn.txt"}),".",e.jsx("br",{}),"Giải nén → copy video vào ",e.jsx("b",{children:"cùng thư mục"})," → đổi tên thành ",e.jsx("b",{children:"src.mp4"})," → mở ",e.jsx("b",{children:"video.html"})," là xong.",e.jsx("br",{}),"Chạy ",e.jsx("b",{children:"hoàn toàn offline"}),", không cần internet."]}),e.jsx(fe,{variant:"contained",fullWidth:!0,onClick:h,disabled:i,startIcon:i?e.jsx(et,{size:16,color:"inherit"}):e.jsx(qe,{}),sx:{background:"#43a047",textTransform:"none",fontWeight:700,"&:hover":{background:"#388e3c"}},children:i?"Đang tạo ZIP...":"Tải xuống ZIP"}),e.jsx(fe,{variant:"text",fullWidth:!0,component:"a",href:"https://youtu.be/eNgN2-Bp_iA?si=a6DT1u2s2KRaLegN",target:"_blank",rel:"noopener noreferrer",startIcon:e.jsx(Lt,{}),sx:{mt:1,textTransform:"none",fontWeight:600},children:"Xem video hướng dẫn"})]})}),e.jsx(tt,{sx:{px:3,pb:2},children:e.jsx(fe,{onClick:m,disabled:i,color:"inherit",children:"Đóng"})})]})}function Gt({onEditLesson:t,onCreateNew:a,onStartVideo:n,toast:l}){const{t:i}=J("interactiveVideo"),[d,m]=o.useState([]),[h,T]=o.useState(!0),{currentUser:k}=Ee(),[L,q]=o.useState(!1),[I,w]=o.useState(null),[A,v]=o.useState(!1),[f,p]=o.useState(!1),[C,j]=o.useState(null),[B,O]=o.useState(!1),[z,R]=o.useState(null),{apply:H,toolbar:W}=St({getCount:u=>{var E;return((E=u.quizzes)==null?void 0:E.length)||0}}),_=H(d),{accessInfo:x,isPinned:F,canAccessById:Z,handleTogglePin:X,pinLimitReached:K,pinLimit:s}=Ct("interactiveVideo",d);o.useEffect(()=>{c()},[k]);const c=async()=>{if(k)try{T(!0);const u=await at(k.uid);m(u)}catch(u){console.error("Error fetching lessons:",u),l&&l.error(i("myLessons.loadFail"))}finally{T(!1)}},{confirmDelete:b,deleteDialog:S}=At(),M=async u=>{const E=u.id;if(await b({userId:k.uid,feature:"interactive_video",lesson:u,message:i("myLessons.confirmDelete")}))try{await lt(E),m(d.filter(Q=>Q.id!==E)),l&&l.success(i("myLessons.deleteSuccess"))}catch(Q){console.error("Error deleting lesson:",Q),l&&l.error(i("myLessons.deleteFail"))}},N=u=>{if(u.videoType==="local"){l&&l.warning(i("myLessons.localVideoWarning"));return}w(u),q(!0)},U=()=>{q(!1),w(null)},re=()=>{U()},he=u=>{if(u.videoType==="local"){l&&l.warning(i("myLessons.localVideoShareWarning","Chỉ có thể chia sẻ bài dùng YouTube. Bài dùng video local không thể chia sẻ."));return}j({id:u.id,title:u.title||i("myLessons.defaultTitle"),featureId:"interactive-video",data:me(u)}),p(!0)},xe=async u=>{const E=await X(u);E!=null&&E.limitReached?l&&l.warning(i("common:pin.limitReached",{limit:E.limit,item:i("common:pin.lesson")})):l&&l.success(F(u)?i("common:pin.unpinned"):i("common:pin.pinned"))},oe=u=>{const E=x==null?void 0:x.level;if(!(E==="pro"||E==="premium"||E==="expired")){v(!0);return}R(me(u)),O(!0)},ae=u=>{n==null||n(me(u))},le=(u=0)=>{const E=Math.floor(u/60),Q=u%60;return`${E}:${Q.toString().padStart(2,"0")}`};return h?e.jsx("div",{className:"my-lessons-container",children:e.jsx("div",{className:"loading-spinner-large"})}):e.jsxs("div",{className:"my-lessons-container",children:[e.jsx(Tt,{title:e.jsxs(e.Fragment,{children:["📚 ",i("myLessons.title")]}),subtitle:i("myLessons.subtitle"),toolbar:d.length>0?W:void 0}),d.length>0&&e.jsxs("div",{style:{background:x!=null&&x.isExpired?"#fff3e0":"#fffde7",border:`1px solid ${x!=null&&x.isExpired?"#ff9800":"#fdd835"}`,borderRadius:8,padding:"8px 14px",marginBottom:16,fontSize:"0.85rem",color:"#5d4037",display:"flex",alignItems:"center",flexWrap:"wrap",gap:8},children:[e.jsx("span",{children:i("common:pin.note",{item:i("common:pin.lesson")})}),e.jsxs("span",{style:{color:"#78909c"},children:["(",d.filter(u=>F(u.id)).length,"/",s," ",i("common:pin.pinnedLabel"),")"]}),(x==null?void 0:x.isExpired)&&e.jsxs("span",{style:{color:"#d32f2f",fontWeight:"bold",marginLeft:"auto"},children:["⚠️ Gói đã hết hạn!"," ",e.jsx("button",{onClick:()=>v(!0),style:{background:"#d32f2f",color:"#fff",border:"none",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:"0.8rem"},children:i("common:actions.renew")})]})]}),d.length===0?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"lessons-grid",children:e.jsx(Se,{title:i("myLessons.demo.title"),subtitle:e.jsxs(ge,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[e.jsx(ue,{label:i("myLessons.demo.badge"),size:"small",sx:{bgcolor:"#fff3e0",color:"#e65100",fontWeight:600}}),e.jsx(ue,{label:`${Ae.quizzes.length} ${i("myLessons.questionCount")}`,size:"small",sx:{bgcolor:"#e3f2fd",color:"#1976d2"}})]}),description:i("myLessons.demo.hint"),accessible:!0,primaryAction:{label:i("myLessons.btnView"),onClick:()=>n==null?void 0:n(me(Ae)),icon:"play",color:"linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"}})}),e.jsx("div",{style:{textAlign:"center",marginTop:16},children:e.jsxs("button",{className:"btn-primary",onClick:a,children:["➕ ",i("myLessons.createFirstBtn","Tạo video đầu tiên")]})})]}):_.length===0?e.jsx("div",{style:{textAlign:"center",padding:"32px 16px",color:"#78909c",fontSize:"0.95rem"},children:i("common:listTools.noResults")}):e.jsx("div",{className:"lessons-grid",children:_.map((u,E)=>{var ee;const Q=Z(u.id);return e.jsx(Se,{title:u.title||`video ${d.length-E}`,subtitle:e.jsxs(ge,{sx:{display:"flex",gap:1,flexWrap:"wrap"},children:[e.jsx(ue,{label:`${((ee=u.quizzes)==null?void 0:ee.length)||0} ${i("myLessons.questionCount")}`,size:"small",sx:{bgcolor:"#e3f2fd",color:"#1976d2"}}),u.startTime>0&&e.jsx(ue,{label:`${i("myLessons.startFrom")} ${le(u.startTime)}`,size:"small",variant:"outlined"})]}),accessible:Q,isPinned:F(u.id),onPinToggle:()=>xe(u.id),pinLimitReached:K,lockedTip:i("lockedTip","Gia hạn để mở bài này"),onUpgrade:()=>v(!0),primaryAction:{label:i("myLessons.btnView"),onClick:()=>ae(u),icon:"play",color:"linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"},onEdit:()=>t(u),onAssign:()=>N(u),onShare:()=>he(u),onDelete:()=>M(u),labels:{edit:i("myLessons.btnEdit"),assign:i("myLessons.btnAssign"),share:i("common:actions.teacherShare"),delete:i("myLessons.btnDelete")},extraActions:(()=>{const te=x==null?void 0:x.level,ne=te==="pro"||te==="premium"||te==="expired";return e.jsx(Ft,{title:ne?"Tải xuống ZIP dùng offline":"Nâng cấp để tải xuống",children:e.jsx(fe,{size:"small",startIcon:e.jsx(yt,{}),onClick:ie=>{ie.stopPropagation(),oe(u)},sx:{color:ne?"#0ea5e9":"#9e9e9e",textTransform:"none",fontSize:"0.75rem","&:hover":{backgroundColor:ne?"rgba(14,165,233,0.1)":"rgba(0,0,0,0.04)"}},children:"Tải xuống"})})})()},u.id)})}),I&&e.jsx(wt,{open:L,onClose:U,game:{id:I.id,title:I.title||i("myLessons.defaultTitle"),featureId:"interactive-video",data:{title:I.title,youtubeUrl:I.youtubeUrl,quizzes:I.quizzes,allowSeeking:I.allowSeeking??!0,startTime:I.startTime??0}},onSuccess:re}),C&&e.jsx(jt,{open:f,onClose:()=>{p(!1),j(null)},game:C}),e.jsx(Yt,{open:B,onClose:()=>{O(!1),R(null)},lesson:z,toast:l}),S,e.jsx(Be,{feature:"interactiveVideo",open:A,onClose:()=>v(!1)})]})}function mi(){const{t}=J(["interactiveVideo","common"]),[a,n]=o.useState("my-lessons"),[l,i]=o.useState(null),[d,m]=o.useState(null),[h,T]=o.useState("my-lessons"),{toasts:k,toast:L,removeToast:q}=nt(),{subscriptionStatus:I,rawSub:w,showUpgradeModal:A,upgradeFeature:v,openUpgradeModal:f,closeUpgradeModal:p,showHelpModal:C,openHelpModal:j,closeHelpModal:B}=zt("interactiveVideo"),{subscription:O}=ze(),z=Le(O,"interactiveVideo"),R=()=>{if(!z.canUse){f("interactiveVideo");return}m(null),n("create")},H=F=>{i(F),T(a),n("preview")},W=()=>{n(h),h!=="create"&&m(null)},_=F=>{m(F),T("create"),n("create")},x=[{id:"create",icon:"➕",label:t("sidebar.createNew"),view:"create"},{id:"my-lessons",icon:"📚",label:t("sidebar.myLessons"),view:"my-lessons"}];return e.jsxs("div",{className:"interactive-video-page",children:[a!=="preview"&&e.jsx(it,{}),e.jsx(st,{toasts:k,removeToast:q}),e.jsxs("div",{className:"iv-container",children:[a!=="preview"&&e.jsx(kt,{bugReportUrl:"https://docs.google.com/document/d/1EZFCwLi5-uJd2IXZ5tlgZ4j9cOI2TxZU/edit?tab=t.0",className:"iv-sidebar",title:t("sidebar.title"),subscriptionStatus:I,rawSub:w,featureKey:"interactiveVideo",navItems:x,activeView:a,onNavClick:F=>{if(F.view==="create"){R();return}n(F.view)},onUpgradeClick:()=>f("interactiveVideo"),upgradeLabel:t("sidebar.upgradePro"),onHelpClick:j,helpLabel:t(a==="create"?"sidebar.guide":"sidebar.guideUsage")}),e.jsx("div",{className:"iv-main-area",children:e.jsxs("div",{className:`iv-content ${a==="preview"?"full-width":""}`,children:[a==="create"&&e.jsx(Pt,{onStartVideo:H,editingLesson:d,toast:L,onSaveSuccess:()=>{m(null),n("my-lessons")}},(d==null?void 0:d.id)??"new"),a==="my-lessons"&&e.jsx(Gt,{onEditLesson:_,onCreateNew:R,onStartVideo:H,toast:L}),a==="preview"&&e.jsx("div",{className:"preview-wrapper",children:e.jsx(vt,{quizData:l,onBack:W})})]})})]}),e.jsx(Et,{isOpen:C,onClose:B,videoId:"Y79KIaXaLsM",title:t("helpModal.title"),description:t("helpModal.description")}),e.jsx(Be,{feature:v,open:A,onClose:p})]})}export{mi as default};
