import{r as o,j as e}from"./vendor-react-Cg7KvPel.js";import{c as re,u as ie,y as ne,m as f,p as H,A as se}from"./index-DnvAnRgE.js";import{b as oe,h as ae,d as le,s as de}from"./gallerySubmissionService-DVm2fP6k.js";import"./vendor-3d-BEYLZICz.js";import"./vendor-firebase-CDwhJuH3.js";import"./vendor-katex-DqEyuLHo.js";import"./browser-image-compression-BzWLnoYn.js";import"./joinCodeService-DZVtGwtI.js";function ye(){const{t:i}=re("panorama"),{sessionId:h}=ie(),[O]=ne(),A=O.get("code")||"",[a,Y]=o.useState(null),[G,C]=o.useState(!0),[E,v]=o.useState(""),[U,w]=o.useState([]),[D,k]=o.useState([]),[L,z]=o.useState([]),[d,P]=o.useState([]),[j,I]=o.useState([]),[g,B]=o.useState(!1),[u,q]=o.useState({current:0,total:0}),[K,X]=o.useState(!1),[M,N]=o.useState(!1),[F,x]=o.useState(""),[S,R]=o.useState(0),T=o.useRef(null);o.useEffect(()=>{(async()=>{var r,s;try{C(!0);const n=await oe(h);if(!n){v(i("student.sessionNotFound"));return}if(((s=(r=n.expiresAt)==null?void 0:r.toDate)==null?void 0:s.call(r))<new Date){v(i("student.sessionExpired"));return}Y(n),n.allowMultiple?R(await le(h)):await ae(h)&&N(!0)}catch(n){console.error("Load session error:",n),v(i("student.loadError"))}finally{C(!1)}})()},[h]);const $=t=>{const r=Array.from(t.target.files),s=Math.max(0,((a==null?void 0:a.maxPerStudent)||3)-S),n=[...d,...r],c=n.slice(0,s),_=n.length-c.length;_>0?x(i("student.errorTooManyFiles",{dropped:_,max:s})):x(""),j.forEach(p=>URL.revokeObjectURL(p)),P(c),I(c.map(p=>URL.createObjectURL(p))),w(p=>{const l=[...p];for(;l.length<c.length;)l.push("");return l.slice(0,c.length)}),k(p=>{const l=[...p];for(;l.length<c.length;)l.push("");return l.slice(0,c.length)}),z(p=>{const l=[...p];for(;l.length<c.length;)l.push("");return l.slice(0,c.length)}),t.target.value=""},J=t=>{URL.revokeObjectURL(j[t]),P(r=>r.filter((s,n)=>n!==t)),I(r=>r.filter((s,n)=>n!==t)),w(r=>r.filter((s,n)=>n!==t)),k(r=>r.filter((s,n)=>n!==t)),z(r=>r.filter((s,n)=>n!==t))},Q=(t,r)=>{k(s=>{const n=[...s];return n[t]=r,n})},V=(t,r)=>{z(s=>{const n=[...s];return n[t]=r,n})},Z=(t,r)=>{w(s=>{const n=[...s];return n[t]=r,n})},ee=async()=>{if(d.length===0){x(i("student.errorNoFiles"));return}B(!0),x("");try{await de({sessionId:h,code:a.code,teacherUid:a.teacherUid,roomId:a.roomId,titles:U,descriptions:D,authorNames:L,files:d,onProgress:(t,r)=>q({current:t,total:r}),allowMultiple:!!a.allowMultiple,maxPerStudent:a.maxPerStudent||3}),R(t=>t+d.length),X(!0),j.forEach(t=>URL.revokeObjectURL(t))}catch(t){console.error("Submit error:",t),t.message==="ALREADY_SUBMITTED"?N(!0):t.message==="IMAGE_LIMIT_EXCEEDED"?(R(t.limit-t.remaining),x(i("student.imageLimitExceeded",{remaining:t.remaining,limit:t.limit}))):t.message==="MAX_SUBMISSIONS_REACHED"?x(i("student.maxSubmissionsReached")):x(i("student.uploadError"))}finally{B(!1)}},m={minHeight:"100vh",background:"linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 16px"},b={background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"24px",padding:"40px",maxWidth:"520px",width:"100%",color:"white"};if(G)return e.jsx("div",{style:m,children:e.jsx("div",{style:b,children:e.jsxs("div",{style:{textAlign:"center",padding:"40px 0"},children:[e.jsx("div",{style:{width:48,height:48,border:"4px solid rgba(255,255,255,0.2)",borderTopColor:"#10b981",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 16px"}}),e.jsx("p",{style:{color:"rgba(255,255,255,0.7)"},children:i("student.loadingInfo")})]})})});if(E)return e.jsx("div",{style:m,children:e.jsxs("div",{style:{...b,textAlign:"center"},children:[e.jsx("div",{style:{fontSize:64,marginBottom:16},children:"⏰"}),e.jsx("h2",{style:{fontSize:"1.4rem",marginBottom:12},children:i("student.unavailableTitle")}),e.jsx("p",{style:{color:"rgba(255,255,255,0.7)",lineHeight:1.6},children:E}),e.jsx("p",{style:{color:"rgba(255,255,255,0.5)",marginTop:16,fontSize:"0.85rem"},children:i("student.contactTeacher")})]})});const te=(a==null?void 0:a.maxPerStudent)||3,y=Math.max(0,te-S),W=!M&&S>0&&y===0;return M||W?e.jsx("div",{style:m,children:e.jsxs("div",{style:{...b,textAlign:"center"},children:[e.jsx("div",{style:{fontSize:64,marginBottom:16},children:"✅"}),e.jsx("h2",{style:{fontSize:"1.4rem",marginBottom:12},children:i("student.alreadySubmittedTitle")}),e.jsx("p",{style:{color:"rgba(255,255,255,0.7)",lineHeight:1.6},children:W?i("student.quotaUsedUpDesc",{count:S}):i("student.alreadySubmittedDesc")}),e.jsx("div",{style:{marginTop:24,padding:"16px",borderRadius:"12px",background:"rgba(16, 185, 129, 0.15)",border:"1px solid rgba(16, 185, 129, 0.3)"},children:e.jsx("p",{style:{color:"#10b981",margin:0,fontWeight:600},children:i("student.thanksParticipating")})})]})}):K?e.jsx("div",{style:m,children:e.jsxs(f.div,{style:{...b,textAlign:"center"},initial:{scale:.8,opacity:0},animate:{scale:1,opacity:1},transition:{type:"spring",stiffness:200},children:[e.jsx(f.div,{style:{fontSize:72,marginBottom:16},initial:{rotateY:0},animate:{rotateY:360},transition:{duration:.8},children:"🎉"}),e.jsx("h2",{style:{fontSize:"1.5rem",marginBottom:12,fontWeight:700},children:i("student.successTitle")}),e.jsx("p",{style:{color:"rgba(255,255,255,0.7)",lineHeight:1.6},children:e.jsx(H,{i18nKey:"panorama:student.successDesc",values:{count:d.length},components:{bold:e.jsx("strong",{}),br:e.jsx("br",{})}})}),e.jsx("div",{style:{marginTop:24,padding:"16px",borderRadius:"12px",background:"rgba(16, 185, 129, 0.15)",border:"1px solid rgba(16, 185, 129, 0.3)"},children:e.jsx("p",{style:{color:"#10b981",margin:0,fontWeight:600},children:i("student.congratsTask")})})]})}):e.jsxs("div",{style:m,children:[e.jsx("style",{children:`
        @keyframes spin { to { transform: rotate(360deg); } }
        .gallery-upload-input { display: none; }
        .gallery-drop-zone {
          border: 2px dashed rgba(16, 185, 129, 0.5);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(16, 185, 129, 0.05);
        }
        .gallery-drop-zone:hover {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        .gallery-preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        .gallery-preview-item {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 1;
          background: rgba(255,255,255,0.1);
        }
        .gallery-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gallery-preview-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          line-height: 1;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 20px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}),e.jsxs(f.div,{style:b,initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.5},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:32},children:[e.jsx("div",{style:{fontSize:56,marginBottom:8},children:"🎨"}),e.jsx("h1",{style:{fontSize:"1.6rem",fontWeight:800,margin:"0 0 8px"},children:i("walkable.title")}),e.jsx("p",{style:{color:"rgba(255,255,255,0.6)",margin:0,fontSize:"0.9rem"},children:i("student.uploadLimit",{count:y})})]}),e.jsx("input",{type:"file",ref:T,className:"gallery-upload-input",multiple:!0,accept:"image/*",onChange:$,disabled:g}),d.length===0?e.jsxs("div",{className:"gallery-drop-zone",onClick:()=>{var t;return(t=T.current)==null?void 0:t.click()},children:[e.jsx("div",{style:{fontSize:48,marginBottom:12},children:"📁"}),e.jsx("p",{style:{margin:"0 0 8px",fontWeight:600},children:i("student.clickToSelect")}),e.jsx("p",{style:{margin:0,fontSize:"0.85rem",color:"rgba(255,255,255,0.5)"},children:i("student.fileFormatHint",{max:y})}),e.jsx("p",{style:{margin:"8px 0 0",fontSize:"0.8rem",color:"rgba(16,185,129,0.8)"},children:i("student.compressionHint")})]}):e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8},children:[e.jsx("span",{style:{fontWeight:600,fontSize:"0.9rem"},children:i("student.selectedCount",{current:d.length,max:y})}),d.length<y&&e.jsx("button",{onClick:()=>{var t;return(t=T.current)==null?void 0:t.click()},disabled:g,style:{padding:"6px 12px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"white",cursor:"pointer",fontSize:"0.85rem"},children:i("student.btnAddMore")})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"16px",marginTop:16},children:e.jsx(se,{children:j.map((t,r)=>e.jsxs(f.div,{initial:{opacity:0,scale:.8},animate:{opacity:1,scale:1},exit:{opacity:0,scale:.8},style:{display:"flex",gap:"12px",alignItems:"flex-start",background:"rgba(255,255,255,0.05)",borderRadius:"12px",padding:"10px",border:"1px solid rgba(255,255,255,0.1)"},children:[e.jsxs("div",{style:{width:"80px",height:"80px",borderRadius:"8px",overflow:"hidden",flexShrink:0,position:"relative"},children:[e.jsx("img",{src:t,alt:`Preview ${r+1}`,style:{width:"100%",height:"100%",objectFit:"cover"}}),e.jsx("button",{className:"gallery-preview-remove",onClick:()=>J(r),disabled:g,children:"×"})]}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px"},children:[e.jsx("label",{style:{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",fontWeight:600},children:i("student.imageTitleLabel",{index:r+1})}),e.jsx("input",{type:"text",placeholder:i("student.imageTitlePlaceholder"),value:U[r]||"",onChange:s=>Z(r,s.target.value),disabled:g,maxLength:80,style:{width:"100%",padding:"8px 12px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"white",fontSize:"0.85rem",outline:"none",boxSizing:"border-box"}})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px"},children:[e.jsx("label",{style:{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",fontWeight:600},children:i("student.imageAuthorLabel",{index:r+1})}),e.jsx("input",{type:"text",placeholder:i("student.imageAuthorPlaceholder"),value:L[r]||"",onChange:s=>V(r,s.target.value),disabled:g,style:{width:"100%",padding:"8px 12px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"white",fontSize:"0.85rem",outline:"none",boxSizing:"border-box"}})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"4px"},children:[e.jsx("label",{style:{fontSize:"0.8rem",color:"rgba(255,255,255,0.5)",fontWeight:600},children:i("student.imageDescLabel",{index:r+1})}),e.jsx("input",{type:"text",placeholder:i("student.imageDescPlaceholder"),value:D[r]||"",onChange:s=>Q(r,s.target.value),disabled:g,style:{width:"100%",padding:"8px 12px",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"white",fontSize:"0.85rem",outline:"none",boxSizing:"border-box"}})]})]})]},r))})})]}),F&&e.jsxs("div",{style:{marginTop:16,padding:"12px 16px",background:"rgba(239, 68, 68, 0.15)",border:"1px solid rgba(239, 68, 68, 0.4)",borderRadius:"10px",color:"#fca5a5",fontSize:"0.9rem"},children:["⚠️ ",F]}),g&&e.jsxs("div",{style:{marginTop:16},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:"0.85rem",color:"rgba(255,255,255,0.7)"},children:[e.jsx("span",{children:i("student.uploadingStatus")}),e.jsxs("span",{children:[u.current,"/",u.total]})]}),e.jsx("div",{style:{height:6,background:"rgba(255,255,255,0.1)",borderRadius:3,overflow:"hidden"},children:e.jsx(f.div,{style:{height:"100%",background:"linear-gradient(90deg, #10b981, #059669)",borderRadius:3},animate:{width:u.total>0?`${u.current/u.total*100}%`:"0%"},transition:{duration:.3}})})]}),e.jsx("button",{className:"submit-btn",onClick:ee,disabled:g||d.length===0,children:g?i("student.btnUploadingProgress",{current:u.current,total:u.total}):i("student.btnSubmit",{count:d.length})}),e.jsx("p",{style:{textAlign:"center",fontSize:"0.8rem",color:"rgba(255,255,255,0.4)",marginTop:16,marginBottom:0},children:i("student.footerNote")}),A&&e.jsx("p",{style:{textAlign:"center",fontSize:"0.9rem",color:"#10b981",marginTop:12,marginBottom:0},children:e.jsx(H,{i18nKey:"panorama:student.pageForCode",values:{code:A},components:{bold:e.jsx("strong",{})}})})]})]})}export{ye as default};
