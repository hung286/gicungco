// Paired cels preserve the painted mouth-to-fabric contact during the tug.
// All six cels keep the boy's long trousers fully fastened.
function drawTug(e){
 const q=e.q,im=imgs['tug-v6'],boy=list.find(p=>p.gender==='nam'&&p.id!==selected?.id)||list.find(p=>p.gender==='nam');
 const steps=q<.65?0:Math.min(3,Math.floor((q-.65)/.38)+1),pull=steps*17;
 let pose=q<.65?0:q<1.8?1:q<3.05?2:q<3.65?3:q<4.55?4:Math.floor((q-4.55)*8)%2?4:5;
 const s=.57,left=675+pull,top=545,ground=top+470*s,escape=q<4.55?0:Story.smooth((q-4.55)/1.65)*510;
 const bounds=[0,490,1018,1536],col=pose%3,sx=bounds[col],sw=bounds[col+1]-sx,sy=Math.floor(pose/3)*512;
 shadow(left+155*s-escape,ground,37);shadow(left+410*s,ground,36);
 if(q<4.55){
   const lean=!reduced&&q>=.65&&q<1.8?Math.sin((q-.65)*Math.PI/.38)*2:0;
   ctx.drawImage(im,sx,sy,sw,512,left,top+lean,sw*s,512*s);
 }else{
   // Boy and dog are separate after release: only the boy exits the frame.
   ctx.drawImage(im,sx,sy,294,512,left-escape,top,294*s,512*s);
   // The sitting puppy remains planted on the road.
   ctx.drawImage(im,790,512,204,512,left+300*s,top,204*s,512*s);
   if(!reduced)dust(left+140*s-escape,ground,3);
 }
 const bx=left+150*s-escape;
 if(boy)tag(boy,bx,ground,250);else text('Bạn nam trong hoạt cảnh',bx,top-23,20,'#334d44');
 if(e.key==='grab')bubble('Ơ… ai kéo vậy?!',bx,top-55,25);
 if(e.key==='tug')bubble('Khoan… khoan đã!',bx,top-55,25);
 if(e.key==='cry'){bubble('Cứu tớ với!',bx,top-55,30);if(!reduced)sweat(bx+55,top+65,4);}
 if(e.key==='release')bubble('Ối! Tớ nhả rồi!',left+410*s,top-45,24);
 if(e.key==='balance')bubble('Giữ chặt đã…',bx,top-55,24);
 if(e.key==='escape')bubble('Suýt mất cả quần!',bx,top-55,26);
}
