(function(g){
const TREE_START=14.25,TREE_END=17.85,SNIFF_START=19.8,SNIFF_END=25.2,DUR=39.05;
const steps=[{at:0,key:'block',title:'Chặn được rồi…'},{at:.55,key:'sniff1',title:'Khịt… lần thứ nhất'},{at:1.25,key:'sniff2',title:'Khịt… lần thứ hai'},{at:1.95,key:'hold',title:'Nín thở…'},{at:2.45,key:'judge',title:'Ơ… không phải đứa này!'},{at:3.25,key:'turn',title:'Cún quay đi…'},{at:3.65,key:'relief',title:'Hú hồn!'},{at:4.45,key:'bark',title:'GÂU! Đuổi tiếp!'}];
function at(real){if(real>=TREE_START&&real<TREE_END){const q=real-TREE_START;return{type:'tree',q,key:q<.65?'quiet':q<1.2?'squeak':q<1.6?'look':q<2.2?'grin':q<2.8?'grip':'leave',title:q<.65?'Ôm cây, im lặng…':q<1.2?'Chít! Gà trong túi kêu!':q<1.6?'Cún ngẩng lên…':q<2.2?'Cười gượng…':q<2.8?'Ôm chặt nữa!':'Cún chạy đi…'};}
if(real>=SNIFF_START&&real<SNIFF_END){const q=real-SNIFF_START;return{type:'sniff',q,...steps.findLast(s=>s.at<=q)};}return null;}
function map(real){if(real<TREE_START)return real;if(real<TREE_END)return TREE_START;if(real<SNIFF_START)return real-3.6;if(real<SNIFF_END)return 16.2;return real-7.85;}
function toReal(base){return base<14.25?base:base<16.2?base+3.6:base<17.35?SNIFF_START:base+7.85;}
function beats(base){const b=base.filter(x=>x.key!=='wrong').map(x=>({...x,at:toReal(x.at)}));for(const q of [0,.65,1.2,1.6,2.2,2.8])b.push({at:TREE_START+q,key:'tree'});for(const s of steps)b.push({...s,at:SNIFF_START+s.at});return b.sort((a,b)=>a.at-b.at);}
function musicGain(real){const e=at(real);if(!e)return 1;if(e.type==='tree')return e.q<2.8?.2:1;return e.q<.55?Math.max(0,1-e.q/.55):e.q<4.65?0:Math.min(1,(e.q-4.65)/.75);}
const cues=[{key:'tree-toy',at:TREE_START+.65,sound:'squeak'},{key:'sniff-1',at:SNIFF_START+.72,sound:'sniff'},{key:'sniff-2',at:SNIFF_START+1.42,sound:'sniff'},{key:'release-bark',at:SNIFF_START+4.45,sound:'woof'}];
g.Events={at,map,toReal,beats,musicGain,cues,TREE_START,TREE_END,SNIFF_START,SNIFF_END,DUR};if(typeof module!=='undefined')module.exports=g.Events;
})(globalThis);
