(function(g){const previous=g.Events,SLEEP_START=4,SLEEP_END=8.2,SHIFT=2.4;
const phases=[{at:0,key:'asleep',title:'Cún ngủ rồi… bước nhẹ thôi!'},{at:1.25,key:'peek',title:'Một mắt hé mở…'},{at:2.25,key:'tail-stop',title:'Đuôi khựng lại…'},{at:3,key:'coil',title:'Thu chân chuẩn bị…'},{at:3.45,key:'spring',title:'Cún bật dậy!'},{at:3.95,key:'land',title:'Bị phát hiện rồi!'}];
function at(real){if(real>=SLEEP_START&&real<SLEEP_END){const q=real-SLEEP_START;return{type:'sleep',q,...phases.findLast(p=>p.at<=q)};}return previous.at(real<SLEEP_START?real:real-SHIFT);}
function map(real){return real<SLEEP_START?previous.map(real):real<SLEEP_END?4:previous.map(real-SHIFT);}
function toReal(base){return base<4?previous.toReal(base):base<5.8?SLEEP_START:previous.toReal(base)+SHIFT;}
function beats(base){const a=previous.beats(base).map(b=>({...b,at:b.at<4?b.at:b.at+SHIFT}));for(const p of phases)a.push({...p,at:SLEEP_START+p.at});return a.sort((a,b)=>a.at-b.at);}
function musicGain(real){const e=at(real);if(e?.type==='sleep')return e.q<2.25?.18:e.q<3.45?0:1;return previous.musicGain(real<SLEEP_START?real:real-SHIFT);}
g.Events={...previous,at,map,toReal,beats,musicGain,cues:previous.cues.map(c=>({...c,at:c.at<4?c.at:c.at+SHIFT})).concat({key:'trap-bark',at:SLEEP_START+3.45,sound:'woof'}),SLEEP_START,SLEEP_END,TREE_START:previous.TREE_START+SHIFT,TREE_END:previous.TREE_END+SHIFT,SNIFF_START:previous.SNIFF_START+SHIFT,SNIFF_END:previous.SNIFF_END+SHIFT,DUR:previous.DUR+SHIFT};
if(typeof module!=='undefined')module.exports=g.Events;})(globalThis);
