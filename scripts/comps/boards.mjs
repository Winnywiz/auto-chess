// Board construction helpers: availability by level, stars, placement and item holders.
import {roster,data,boardValue,activeTraits,front} from './common.mjs';
export const ODDS={5:[58,32,9,1,0],6:[42,40,15,3,0],7:[22,32,34,12,0],8:[14,22,32,26,6],9:[6,14,27,36,17]};
// A unit is planned for a level when its cost shows up in at least ~9% of shop slots, or 1★ legendaries at level 8.
export const availableAt=(line,level)=>{const c=roster[line].cost;return level>=9||ODDS[level][c-1]>=9||(level===8&&c===5);};
export function starAt(line,level,{finalStar=2,locked=[],rollLevel=null}={}){
  const c=roster[line].cost;
  if(finalStar===3&&(locked.includes(line)||rollLevel)&&level>=(rollLevel??5)&&c<=3)return 3;
  if(c<=2)return 2;
  if(c===3)return level>=6?2:1;
  if(c===4)return level>=8?2:1;
  return 1;
}
const FRONT=[31,30,32,29,33,28,34,38,37,39,36,40,35,41],BACK=[52,53,51,54,50,55,49,45,44,46,43,47,42,48];
export function arrange(team,hint={}){
  const used=new Set(),out=team.map(u=>({...u}));
  for(const u of out){const h=hint[u.line];if(h!==undefined&&!used.has(h)){u.cell=h;used.add(h);}else u.cell=undefined;}
  for(const u of out)if(u.cell===undefined){const zone=front(u.line)?FRONT:BACK;u.cell=zone.find(c=>!used.has(c))??[...FRONT,...BACK].find(c=>!used.has(c));used.add(u.cell);}
  return out;
}
export const fitScore=(line,star,item)=>roster[line].forms[star-1].itemFit.find(x=>x.id===item)?.score??0;
// Pick a temporary holder for a set of items: the board unit whose native fit for those items is highest.
export function holderFor(team,items,exclude=new Set()){
  let best=null,bestScore=-1;
  for(const u of team){if(exclude.has(u.line))continue;const s=items.reduce((a,i)=>a+fitScore(u.line,u.star,i),0)+roster[u.line].cost*.05+u.star*.1;if(s>bestScore){bestScore=s;best=u;}}
  return best;
}
export {boardValue,activeTraits};
export const isNovel=(team,others,minDiff=3)=>others.every(o=>{const a=new Set(team.map(u=>u.line));return o.filter(u=>!a.has(u.line)).length>=minDiff;});
