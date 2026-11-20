(function(g){
const DUR=31.2;
const beats=[{at:0,key:'creep',title:'01 · Rón rén đi qua'},{at:1.35,key:'startle',title:'02 · Suỵt! Cún nghe thấy…'},{at:3.15,key:'relief',title:'03 · Phù… hú hồn!'},{at:5.8,key:'alert',title:'04 · Chết rồi…'},{at:6.6,key:'growl',title:'05 · Đứa nào chưa học bài?'},{at:9.15,key:'bark',title:'06 · GÂU! Chạy thôi!'},{at:9.65,key:'chase',title:'07 · Chạy rớt dép'},{at:16.2,key:'wrong',title:'08 · Ơ… không phải đứa này!'},{at:17.35,key:'return',title:'09 · Lách! Lách! Quay lại!'},{at:20.85,key:'target',title:'10 · Em… em chưa chuẩn bị!'},{at:22.3,key:'caught',title:'11 · BẮT ĐƯỢC!'},{at:23.65,key:'dance',title:'12 · Cha cha cha!'},{at:27.1,key:'result',title:'13 · Mời bạn lên bảng'}];
function lerp(a,b,q){return a+(b-a)*q;}function smooth(q){q=Math.max(0,Math.min(1,q));return q*q*(3-2*q);}function track(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(t<=keys[i][0])return lerp(keys[i-1][1],keys[i][1],(t-keys[i-1][0])/(keys[i][0]-keys[i-1][0]));return keys.at(-1)[1];}
function sample(t){t=Math.max(0,Math.min(DUR,t));const beat=beats.findLast(x=>x.at<=t);const camera=t<9.65?0:t<13?1360*smooth((t-9.65)/3.35):t<13.8?1360*(1-smooth((t-13)/.8)):t<15.5?0:t<16?1360*smooth((t-15.5)/.5):t<17.35?1360:t<20.85?1360*(1-smooth((t-17.35)/3.5)):0;
const crowdShift=track(t,[[0,0],[1.35,50],[3.15,50],[5.8,140],[9.65,140],[14.9,1850],[15.8,1850],[20.85,0],[23,-1600],[DUR,-2000]]);
const dogX=track(t,[[0,470],[9.65,470],[15.8,2600],[17.35,2060],[20.85,1020],[22.3,900],[DUR,900]]);
return {t,key:beat.key,title:beat.title,camera,crowdShift,dogX,reverse:t>=15.8,running:['chase','return'].includes(beat.key),caught:t>=22.3,reveal:t>=27.1};}
g.Story={DUR,beats,sample,track,smooth};if(typeof module!=='undefined')module.exports=g.Story;
})(globalThis);
