function eventPupil(p,pose,x,y,h,rotation=0){sprite(imgs['pupil-v4'],EVENT_ART['pupil-v4'][(p.gender==='nữ'?4:0)+pose],x,y,h,false,rotation);}
function eventDog(pose,x,y,h,flip=false,rotation=0){sprite(imgs['dog-v4'],EVENT_ART['dog-v4'][pose],x,y,h,flip,rotation);}
function eventCast(){const focus=selected||list[0],others=list.filter(p=>p.id!==focus.id);return{focus,climber:others[0]||focus,wrong:others[1]||others[0]||focus};}
function drawEvent(e){if(e.type==='tug'){drawTug(e);return;}if(e.type==='sleep'){drawSleep(e);return;}const{climber,wrong}=eventCast(),q=e.q;
if(e.type==='tree'){
 const pose=e.key==='grin'?1:e.key==='grip'||e.key==='leave'?2:0;drawTreeHug(climber,pose);
 const dogX=q<1.2?Story.track(q,[[0,1700],[1.2,320]]):q<2.8?320:Story.track(q,[[2.8,320],[3.6,1700]]);
 if(q<1.2||q>=2.8){shadow(dogX,817,44);sprite(imgs.dog,sprites.d[1+Math.floor(q*10)%2],dogX,817,130,q<1.2);dust(dogX,817,2);}else{shadow(dogX,817,42);eventDog(3,dogX,817,145);}
 if(e.key==='quiet')bubble('Im nào…',330,275,23);
 if(e.key==='squeak')shout('CHÍT!',230,455,37);
 if(e.key==='look')bubble('?!',dogX,615,30);
 if(e.key==='grin')bubble('Hì… hì…',330,275,23);
 if(e.key==='grip')bubble('Đừng kêu nữa mà…',370,270,23);
 if(e.key==='leave')bubble('Suýt nữa…',300,300,22);
 return;
}
const index=list.findIndex(p=>p.id===wrong.id),row=Math.floor(index/11),col=index%11;
const endX=230+col*96+row*17+Story.sample(17.35).crowdShift+Math.sin(index*7)*110-1360;
const escape=Story.smooth((q-4.65)/.75),py=817+(690+row*53-817)*escape,px=975+(endX-975)*escape,ph=165+(137-165)*escape;
shadow(px,py,29);
if(q>=4.65){const phase=Math.floor(q*10)%2;pupil(wrong,4+phase,px,py,ph,phase===0);dust(px,py,3);}else{
 const relief=e.key==='relief';const tremble=!reduced&&q<1.95?Math.sin(q*31)*1.2:0;eventPupil(wrong,relief?1:0,px,py+tremble,ph);if(!relief&&e.key!=='hold')sweat(px+27,py-ph+25,2);
}
tag(wrong,px,py,ph);
let dx=1060,dh=128,pose=0,flip=false,rotation=0;
if(q<.55)dx=Story.track(q,[[0,1098],[.55,1060]]);
if(e.key==='sniff1'||e.key==='sniff2'){const start=e.key==='sniff1'?.55:1.25,u=(q-start)/.7;dx-=Math.sin(u*Math.PI)*7;pose=e.key==='sniff1'?0:1;}
if(['hold','judge','turn','relief'].includes(e.key)){pose=e.key==='hold'?1:2;dh=137;flip=e.key==='turn'||e.key==='relief';rotation=e.key==='judge'&&!reduced?Math.sin((q-2.45)*3)*.07:0;}
if(q>=4.65){dx=1060+(700-1060)*escape;shadow(dx,817,44);sprite(imgs.dog,sprites.d[1+Math.floor(q*10)%2],dx,817,130,true);dust(dx,817,2);}else{shadow(dx,817,43);eventDog(pose,dx,817,dh,flip,rotation);}
if(e.key==='block')bubble('Ơ… bắt được rồi?!',980,570,23);
if(e.key==='sniff1'||e.key==='sniff2')text('khịt…',1085,665,23,'#65735d');
if(e.key==='hold')text('…',975,580,30,'#30433c');
if(e.key==='judge')bubble('Ơ… không phải đứa này!',1040,565,25);
if(e.key==='relief')bubble('Hú hồn!',975,565,25);
if(e.key==='bark'){if(q<4.85)shout('GÂU!',1060,570,72);else bubble('Á! Lại chạy!',850,565,24);}
}
function draw(){const e=Events.at(playhead);if(e){ctx.clearRect(0,0,1600,900);ctx.save();const cx=e.type==='tree'?100:e.type==='sleep'?800:e.type==='tug'?850:1000,cy=690,z=1+(e.type==='tree'?.22:e.type==='sleep'||e.type==='tug'?0:.12)*Story.smooth(e.q/.4);ctx.translate(cx,cy);ctx.scale(z,z);ctx.translate(-cx,-cy);background(Story.sample(t).camera);drawEvent(e);ctx.restore();$('#chapter').textContent=e.title;}else drawBase();$('#progress').style.width=Math.min(100,playhead/END*100)+'%';if(!$('#timeline').matches(':active'))$('#timeline').value=playhead;$('#clock').textContent=playhead.toFixed(1)+' / '+(Math.round((END+1e-6)*10)/10).toFixed(1)+' s';}
