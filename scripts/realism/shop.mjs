// Conditional shop experiment. Starting level, gold and owned/contested copies are declared inputs,
// not earned-match states. Every shop, paid reroll, purchase and merge uses native v34 functions.
import {create,shop,copies,act} from './native.mjs';
function units(line,n,prefix){const out={};let i=0;for(const star of [2,1])while(n>=3**(star-1)){const id=prefix+(i++);out[id]={id,line,star};n-=3**(star-1);}return out;}
export function shopTrial({line,level,gold,owned,taken,goal},seed){
  const g=create(seed,false),mine=units(line,owned,'u'),enemy=units(line,taken,'e');
  const me=g.st.m.t.players.find(p=>p.id===g.st.me),other=g.st.m.t.players.find(p=>p.id!==g.st.me);
  me.s={...me.s,phase:'planning',round:9,level,xp:0,gold,units:mine,bench:[...Object.keys(mine),...Array(9-Object.keys(mine).length).fill(null)],nextId:20};
  other.s={...other.s,units:enemy,bench:[...Object.keys(enemy),...Array(9-Object.keys(enemy).length).fill(null)]};
  g.st.stage='planning';g.st.m.t.n=9;
  Object.assign(me.s,shop.n(me.s,shop.b(g.st.m.t,g.st.me),level,Object.values(mine),9,0,0));
  let rolls=0,bought=0;
  for(let guard=0;guard<100;guard++){
    for(let slot=0;slot<5;slot++)if(g.me.shop[slot]===line&&copies(g.me,line)<goal){const r=act(g,{t:'buy',slot});if(!r.err)bought++;else if(!['noGold','benchFull'].includes(r.err))throw Error(r.err);}
    if(copies(g.me,line)>=goal)return {hit:true,spent:gold-g.me.gold,rolls,bought};
    const r=act(g,{t:'reroll'});if(r.err){if(r.err!=='noGold')throw Error(r.err);break;}rolls++;
  }
  return {hit:false,spent:gold-g.me.gold,rolls,bought};
}
