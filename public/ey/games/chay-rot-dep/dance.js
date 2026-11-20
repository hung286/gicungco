(function(g){const PERIOD=1.08;const keys=[[0,0],[.12,1],[.26,2],[.34,3],[.60,2],[.69,4],[.83,5],[.98,0]];
function sample(elapsed,reduced=false){if(reduced)return{pose:0,lift:0,phase:0,grounded:true,shadowScale:1};const phase=((elapsed%PERIOD)+PERIOD)%PERIOD;const pose=keys.findLast(k=>phase>=k[0])[1];const q=Math.max(0,Math.min(1,(phase-.28)/.41));const lift=phase>.28&&phase<.69?54*4*q*(1-q):0;return{pose,lift,phase,grounded:lift<.5,shadowScale:1-lift/150};}
g.Dance={sample,PERIOD};if(typeof module!=='undefined')module.exports=g.Dance;})(globalThis);
