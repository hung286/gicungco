(function(g){
const previous=g.Events,TUG_START=previous.SNIFF_END,TUG_LENGTH=6.2,TUG_END=TUG_START+TUG_LENGTH;
const phases=[{at:0,key:'grab',title:'Ơ… ai giữ gấu quần?!'},{at:.65,key:'tug',title:'Cún kéo giật lùi…'},{at:1.8,key:'cry',title:'Cứu tớ với!'},{at:3.05,key:'release',title:'Cún giật mình nhả ra!'},{at:3.65,key:'balance',title:'Giữ chặt cạp quần…'},{at:4.55,key:'escape',title:'Suýt mất cả quần!'}];
const shift=x=>x<TUG_START?x:x+TUG_LENGTH;
function at(real){if(real>=TUG_START&&real<TUG_END){const q=real-TUG_START;return{type:'tug',q,...phases.findLast(p=>p.at<=q)};}return previous.at(real<TUG_START?real:real-TUG_LENGTH);}
function map(real){return previous.map(real<TUG_START?real:real<TUG_END?TUG_START:real-TUG_LENGTH);}
function toReal(base){return shift(previous.toReal(base));}
function beats(base){return previous.beats(base).map(b=>({...b,at:shift(b.at)})).concat(phases.map(p=>({...p,at:TUG_START+p.at}))).sort((a,b)=>a.at-b.at);}
function musicGain(real){const e=at(real);return e?.type==='tug'?(e.q<1.8?.35:e.q<3.05?.08:1):previous.musicGain(real<TUG_START?real:real-TUG_LENGTH);}
g.Events={...previous,at,map,toReal,beats,musicGain,TUG_START,TUG_END,DUR:previous.DUR+TUG_LENGTH,cues:previous.cues.map(c=>({...c,at:shift(c.at)})).concat([{key:'tug-grab',at:TUG_START+.08,sound:'fabric'},{key:'tug-step-1',at:TUG_START+.8,sound:'fabric'},{key:'tug-step-2',at:TUG_START+1.2,sound:'fabric'},{key:'tug-step-3',at:TUG_START+1.6,sound:'fabric'},{key:'tug-cry',at:TUG_START+1.9,sound:'whimper'},{key:'tug-release',at:TUG_START+3.05,sound:'shock'},{key:'tug-run',at:TUG_START+4.55,sound:'squeak'}])};
if(typeof module!=='undefined')module.exports=g.Events;
})(globalThis);
