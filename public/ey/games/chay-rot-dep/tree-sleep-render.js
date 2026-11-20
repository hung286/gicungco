function drawTreeCrown(camera=0){ctx.drawImage(imgs['crown-v5'],-140-camera,75,470,235);}
function drawTreeBase(camera=0){const im=imgs['tree-v5'],x=80-camera,s=.46;ctx.drawImage(im,164,300,80,100,x-27,300,54,328);ctx.drawImage(im,50,460,390,44,x+(50-204)*s,640-44*s,390*s,44*s);drawTreeCrown(camera);}
function drawTreeHug(p,pose,camera=0){
 const im=imgs['tree-v5'],col=Math.max(0,Math.min(2,pose)),row=p.gender==='nữ'?1:0,anchor=[204,168,132][col],s=.46,worldX=80-camera,top=290,left=worldX-anchor*s,cut=anchor+54;
 // Root and bark stay fixed in world space. Far arm/shin occlusion is painted into each cel.
 ctx.drawImage(im,164,300,80,100,worldX-27,470,54,158);
 ctx.drawImage(im,50,460,390,44,worldX+(50-204)*s,640-44*s,390*s,44*s);
 ctx.save();ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left+512*s,top);ctx.lineTo(left+512*s,top+456*s);ctx.lineTo(left+cut*s,top+456*s);ctx.lineTo(left+cut*s,top+420*s);ctx.lineTo(left,top+420*s);ctx.closePath();ctx.clip();ctx.drawImage(im,col*512,row*512,512,456,left,top,512*s,456*s);ctx.restore();
 drawTreeCrown(camera);tag(p,worldX+65,495,195);
}
function sleepDog(im,r,x,floor,height,lift=0){shadow(x,floor,52-lift*.25);sprite(im,r,x,floor-lift,height);}
function drawSleep(e){const q=e.q,sleep=TREE_SLEEP_ART['sleep-v5'].boxes,wink=TREE_SLEEP_ART['wink-v5'].boxes,phase=Math.floor(q*8)%2,walk=Story.smooth(q/2.25),shift=Story.sample(4).crowdShift+60*walk;
 list.forEach((p,i)=>{const row=Math.floor(i/11),col=i%11,x=230+col*96+row*17+shift,y=690+row*53;const startled=q>=3.45;shadow(x,y,25);pupil(p,startled?2:phase,x,y-(reduced?0:startled?0:Math.sin(q*8+i)*2),137,!startled&&phase===1);if(startled)sweat(x+25,y-110,i);tag(p,x,y,137);});
 if(e.key==='asleep'){sleepDog(imgs['sleep-v5'],sleep[reduced?0:phase],470,817,126);text('Zzz…',545,650,24,'#526f68');}
 else if(e.key==='peek')sleepDog(imgs['wink-v5'],wink[reduced?0:phase],470,817,126);
 else if(e.key==='tail-stop'){sleepDog(imgs['wink-v5'],wink[0],470,817,126);text('…',548,650,27);}
 else if(e.key==='coil')sleepDog(imgs['sleep-v5'],sleep[3],470,817,130);
 else if(e.key==='spring'){const u=Math.max(0,Math.min(1,(q-3.45)/.5)),lift=reduced?0:54*4*u*(1-u);sleepDog(imgs['sleep-v5'],sleep[4],470,817,160,lift);shout('GÂU!',570,560,74);}
 else sleepDog(imgs['sleep-v5'],sleep[5],470,817,150);
 if(q<1.25)bubble('Cún ngủ rồi…',1120,535,23);else if(q<3.45)bubble('Đi nhẹ thôi…',1120,535,23);else bubble('Á! Cún tỉnh rồi!',1120,535,25);
}
