const $=s=>document.querySelector(s),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const percent=x=>(x*100).toFixed(1)+'%',signed=x=>(x>=0?'+':'')+(x*100).toFixed(1)+' pp',range=x=>x.map(percent).join(' to ');
let data,level=9,builds=[],a,b,match,reversed=false,replayFile,replay,clock=0,playing=false,lastTick=0,raf=0,loadVersion=0,lastUnitUpdate=-1;
const imageCache=new Map(),replayCache=new Map();
let statMetric='dealt',lastChartKey='';
const statInfo={dealt:{label:'Damage dealt',note:'Enemy HP removed. Overkill and shields excluded.'},taken:{label:'Damage taken',note:'HP lost after shields and damage reduction.'},healed:{label:'Healing',note:'HP restored. Overhealing excluded.'},shielded:{label:'Shields granted',note:'Shields created, including unused shields.'},mitigated:{label:'Damage prevented',note:'Damage blocked by shields and damage reduction.'}};
const theme=t=>{document.documentElement.dataset.theme=t;$('#theme').value=t;document.querySelector('meta[name="theme-color"]').content=t==='pallet'?'#171f30':'#101914';};
try{theme(localStorage.getItem('kanto-theme')==='pallet'?'pallet':'viridian');}catch{theme('viridian');}
$('#theme').onchange=e=>{theme(e.target.value);draw();try{localStorage.setItem('kanto-theme',e.target.value);}catch{}};
function pairFor(x,y){return data.pairs.find(p=>p.level===level&&((p.a===x&&p.b===y)||(p.b===x&&p.a===y)));}
function viewPair(p,id){const rev=p.a!==id;return {score:rev?1-p.score:p.score,interval:rev?[1-p.interval[1],1-p.interval[0]]:p.interval,wins:rev?p.losses:p.wins,draws:p.draws,losses:rev?p.wins:p.losses};}
function chooseLevel(){
 stop();level=Number($('#level').value);builds=[...data.builds[level]].sort((x,y)=>({S:0,A:1}[x.tier]-{S:0,A:1}[y.tier])||x.name.localeCompare(y.name)||x.id.localeCompare(y.id));
 const params=new URLSearchParams(location.hash.slice(1)),oldA=$('#team-a').value||params.get('a'),oldB=$('#team-b').value||params.get('b');
 const options=builds.map(r=>`<option value="${esc(r.id)}">${esc(r.name)} / ${r.tier} / ${r.gold}g${r.id.startsWith('available-')?' / budget':''}</option>`).join('');
 $('#team-a').innerHTML=options;$('#team-b').innerHTML=options;
 $('#team-a').value=builds.some(r=>r.id===oldA)?oldA:'adapt-sheet-3';$('#team-b').value=builds.some(r=>r.id===oldB)?oldB:'adapt-sheet-1';
 ensureDifferent('a');render();
}
function ensureDifferent(changed){if($('#team-a').value===$('#team-b').value){const other=builds.find(r=>r.id!==$('#team-a').value);$(changed==='a'?'#team-b':'#team-a').value=other.id;}}
function roster(r){
 return `<div class="roster">${r.team.map(u=>`<span class="roster-unit" title="${esc(u.name)}, ${u.star} stars, ${esc(u.types.join('/'))}${u.line===r.carry?', carry':''}"><img src="media/icons/${u.num}.png" alt="${esc(u.name)}"><span class="stars">${'★'.repeat(u.star)}</span></span>`).join('')}</div><div class="team-meta"><span class="build-meta">${r.tier} / ${esc(r.strategy)} / ${r.gold}g</span><details class="unit-detail"><summary>Items</summary><div>${r.team.map(u=>`<div>${esc(u.name)} ${u.star}★ / ${u.items.length?u.items.map(i=>esc(i.replaceAll('-',' '))).join(', '):'No items'}</div>`).join('')}</div></details></div>`;
}
function render(){
 stop();a=builds.find(r=>r.id===$('#team-a').value);b=builds.find(r=>r.id===$('#team-b').value);match=pairFor(a.id,b.id);reversed=match.a!==a.id;
 const v=viewPair(match,a.id),own=match.metrics[reversed?1:0],enemy=match.metrics[reversed?0:1],carry=a.team.find(u=>u.line===a.carry),enemyCarry=b.team.find(u=>u.line===b.carry);
 history.replaceState(null,'','#'+new URLSearchParams({level,a:a.id,b:b.id}));
 $('#roster-a').innerHTML=roster(a);$('#roster-b').innerHTML=roster(b);
 const verdict=v.interval[0]>.5?'Favored':v.interval[1]<.5?'Unfavored':'Close matchup';
 $('#result').innerHTML=`<div class="score-block"><div class="score">${percent(v.score)}</div><div><p class="score-label" title="Wins plus half draws divided by battles">Simulation score</p><span class="interval" title="95% paired-seed interval">95%: ${range(v.interval)}</span></div></div><div class="result-summary"><div class="verdict">${verdict}</div><div class="result-bar" aria-hidden="true"><span class="win" style="width:${v.wins/match.n*100}%"></span><span class="draw" style="width:${v.draws/match.n*100}%"></span><span class="loss" style="width:${v.losses/match.n*100}%"></span></div><div class="result-counts"><span>${v.wins} wins</span><span>${v.draws} draws</span><span>${v.losses} losses</span></div></div><span class="battle-count">${match.n} battles</span>`;
 const metric=(label,x,y,title='')=>`<div class="metric-row" title="${esc(title)}"><span>${esc(label)}</span><span>${esc(x)}</span><span>${esc(y)}</span></div>`,seconds=n=>n===null?'No cast':n.toFixed(1)+'s';
 const resisted=own.damage?own.resistedDamage/own.damage:0;
 let note=own.noCast>.1?`${carry.name} missed its first cast in ${percent(own.noCast)} of fights.`:resisted>.15?`${percent(resisted)} of your hit damage was resisted.`:own.life<enemy.life?`${carry.name} fell ${(enemy.life-own.life).toFixed(1)}s earlier than ${enemyCarry.name} on average.`:own.firstCast!==null&&enemy.firstCast!==null&&own.firstCast>enemy.firstCast?`${enemyCarry.name} cast ${(own.firstCast-enemy.firstCast).toFixed(1)}s sooner.`:'';
 $('#weaknesses').innerHTML=`${note?`<p class="weakness-note">${esc(note)}</p>`:''}<div class="metric-head"><span>Battle averages</span><span>Your team</span><span>Opponent</span></div>${metric('Front row survival',seconds(own.frontlineLife),seconds(enemy.frontlineLife))}${metric('Carry survival',seconds(own.life),seconds(enemy.life))}${metric('First carry cast',seconds(own.firstCast),seconds(enemy.firstCast),'Average among battles where the carry cast')}${metric('Carry casts',own.casts.toFixed(1),enemy.casts.toFixed(1))}${metric('Carry control time',seconds(own.control),seconds(enemy.control),'Overlapping control states counted once')}${metric('No carry cast',percent(own.noCast),percent(enemy.noCast))}${metric('Team healing',Math.round(own.healing).toLocaleString(),Math.round(enemy.healing).toLocaleString())}`;
 const ownLayout=match.layouts[reversed?'enemy-flip':'own-flip'],enemyLayout=match.layouts[reversed?'own-flip':'enemy-flip'];
 const ownScore=reversed?1-ownLayout.score:ownLayout.score,enemyScore=reversed?1-enemyLayout.score:enemyLayout.score,delta=reversed?-ownLayout.delta:ownLayout.delta,ci=reversed?[-ownLayout.deltaInterval[1],-ownLayout.deltaInterval[0]]:ownLayout.deltaInterval;
 $('#formation').innerHTML=`<div class="formation-row"><span>Current / ${match.n} battles</span><b>${percent(v.score)}</b></div><div class="formation-row"><span>Your team flipped / ${ownLayout.n} battles</span><b>${percent(ownScore)}</b></div><div class="formation-row"><span>Opponent flipped / ${enemyLayout.n} battles</span><b>${percent(enemyScore)}</b></div><p class="formation-advice">${ci[0]>0?'Try flipping your team left to right.':ci[1]<0?'Keep the current formation.':'No clear gain from flipping your team.'} Paired change ${signed(delta)}. <span title="Paired comparison using the same 64 seeds on both sides">95%: ${signed(ci[0])} to ${signed(ci[1])}.</span></p>`;
 $('#types-a').innerHTML=typeRows(a,b);$('#types-b').innerHTML=typeRows(b,a);
 const counters=builds.filter(r=>r.id!==a.id).map(r=>({r,p:pairFor(a.id,r.id)})).map(x=>({...x,v:viewPair(x.p,a.id)})).sort((x,y)=>x.v.score-y.v.score||x.r.id.localeCompare(y.r.id));
 $('#counter-list').innerHTML=counters.map(({r,v})=>`<tr class="${r.id===b.id?'selected':''}"><td><button data-opponent="${esc(r.id)}">${esc(r.name)}<small>${r.tier} / ${r.gold}g</small></button></td><td title="${v.wins} wins, ${v.draws} draws, ${v.losses} losses">${percent(v.score)}</td><td>${range(v.interval)}</td></tr>`).join('');
 loadReplay(match.key);
}
function typeRows(from,to){
 const grouped=new Map(),variable=[],other=[];for(const u of from.team){if(['metronome','transform'].includes(u.skill.kind)){variable.push(`${u.name}: ${u.skill.name} uses variable types`);continue;}const t=u.skill.empower?.hitType??(u.skill.power&&!u.skill.statusMove?u.skill.type:null);if(!t){other.push(`${u.name} (${u.skill.name})`);continue;}if(!grouped.has(t))grouped.set(t,[]);grouped.get(t).push(u.name);}
 return [...grouped].map(([t,names])=>{
  const interactions=to.team.map(u=>({u,m:u.types.reduce((m,d)=>m*(data.typeChart[t]?.[d]??1),1)}));
  return `<div class="type-row"><strong>${esc(t)} abilities</strong><p>${names.map(esc).join(', ')}</p>${interactions.filter(x=>x.m!==1).map(({u,m})=>`<span class="chip ${m>1?'type-super':'type-resist'}" title="${esc(u.types.join('/'))}">${esc(u.name)} ${m===0?'immune':m+'×'}</span>`).join('')||'<span class="type-neutral">Neutral against all opponents.</span>'}</div>`;
 }).join('')+(variable.length?`<p class="muted">${variable.map(esc).join('. ')}. Actual types appear in the replay.</p>`:'')+(other.length?`<p class="muted">Other effects: ${other.map(esc).join(', ')}. </p>`:'');
}
function stop(){playing=false;cancelAnimationFrame(raf);if($('#play')){$('#play').textContent='▶ Play';$('#play').setAttribute('aria-label','Play replay');}}
async function loadReplay(key){
 const version=++loadVersion;stop();replay=null;replayFile=null;clock=0;lastChartKey='';$('#stats-a').innerHTML='';$('#stats-b').innerHTML='';$('#stat-total-a').textContent='';$('#stat-total-b').textContent='';$('#stat-time').textContent='Loading selected replay…';draw();$('#replay-select').innerHTML='';$('#events').innerHTML='';$('#replay-status').textContent='Loading replay…';$('#play').disabled=true;$('#scrub').disabled=true;$('#replay-note').textContent='';
 try{let file=replayCache.get(key);if(!file){const response=await fetch(`analysis/replays/${encodeURIComponent(key)}.json?v=charts-1`);if(!response.ok)throw Error('Replay file unavailable');file=await response.json();replayCache.set(key,file);}if(version!==loadVersion)return;
  replayFile=file;$('#replay-select').innerHTML=file.replays.map((r,i)=>{const value=reversed?1-r.value:r.value;return `<option value="${i}">${value===1?'Your win':value===0?'Your loss':'Draw'} / ${r.duration.toFixed(1)}s</option>`;}).join('');
  $('#replay-status').textContent='';$('#play').disabled=false;$('#scrub').disabled=false;setReplay(0);
 }catch(e){if(version!==loadVersion)return;$('#replay-status').textContent='Replay unavailable. Reload to try again.';}
}
function setReplay(index){
 stop();replay=replayFile.replays[index];clock=0;lastUnitUpdate=-1;lastChartKey='';$('#scrub').max=replay.duration;$('#scrub').value=0;
 const yourTeam=reversed?1-replay.side:replay.side,value=reversed?1-replay.value:replay.value;
 $('#replay-note').textContent=`Seed ${replay.seed}`;$('#replay-note').title=`Median-duration ${value===1?'win':value===0?'loss':'draw'} example. Your team starts ${yourTeam===0?'at the bottom':'at the top'}.`;
 $('#events').innerHTML=replay.events.map((e,i)=>({e,i})).filter(({e})=>['cast','cc','faint','end','transform'].includes(e.k)).map(({e,i})=>`<li data-event-time="${e.t}"><button data-event="${i}"><span class="event-time">${e.t.toFixed(2)}s</span>${esc(eventText(e))}</button></li>`).join('');
 for(const u of [...replay.units,...(replay.changes??[])]){if(!imageCache.has(u.num)){const img=new Image();img.src=`media/icons/${u.num}.png`;img.onload=()=>draw();imageCache.set(u.num,img);}}
 draw();
}
function eventText(e){const own=reversed?1-replay.side:replay.side,name=id=>{const u=replay.units.find(u=>u.uid===id);if(!u)return 'Unknown';const current=(replay.changes??[]).filter(c=>c.uid===id&&c.t<=e.t).at(-1);return `${u.team===own?'Your':'Enemy'} ${current?.name??u.name}`;};
 if(e.k==='cast')return `${name(e.src)} cast ${e.name} (${e.type}).`;
 if(e.k==='cc')return `${name(e.uid)}: ${e.cc} for ${e.dur?.toFixed(1)??'?'}s.`;
 if(e.k==='faint')return `${name(e.uid)} was eliminated.`;
 if(e.k==='transform')return `${name(e.uid)} transformed.`;
 if(e.k==='end'){const own=reversed?1-replay.side:replay.side;return e.winner===-1?'Battle ended in a draw.':e.winner===own?'Your team won.':'Opponent won.';}
 return e.k;
}
const canvas=$('#arena'),ctx=canvas.getContext('2d');
const xy=cell=>{const row=Math.floor(cell/7),col=cell%7;return {x:80+col*104+(row%2)*52,y:68+row*88};};
function drawCharts(){
 if(!replay)return;const info=statInfo[statMetric];$('#stat-description').textContent=info.note;
 if(!replay.stats?.length){$('#stat-time').textContent='Reload to load statistics.';return;}
 const current=$('#stat-scope').value==='current';let sample=replay.stats.at(-1);
 if(current){sample=replay.stats[0];for(const frame of replay.stats){if(frame[0]>clock)break;sample=frame;}}
 const key=[replay.seed,replay.side,statMetric,current,sample[0],reversed].join('/');if(key===lastChartKey)return;lastChartKey=key;
 const index=replay.statFields.indexOf(statMetric),stride=replay.statFields.length,yourTeam=reversed?1-replay.side:replay.side,rows=replay.units.map((u,i)=>({u,value:sample[1+i*stride+index]})),maximum=Math.max(1,...rows.map(r=>r.value));
 const format=n=>Math.round(n).toLocaleString();
 $('#stat-time').textContent=`${current?'Replay time':'Full battle'} / ${sample[0].toFixed(1)}s`;
 for(const [target,team]of [['a',yourTeam],['b',1-yourTeam]]){const group=rows.filter(r=>r.u.team===team).sort((a,b)=>b.value-a.value||a.u.uid-b.u.uid);$('#stat-total-'+target).textContent=format(group.reduce((sum,r)=>sum+r.value,0));$('#stats-'+target).innerHTML=group.map(({u,value})=>`<li class="stat-row"><img src="media/icons/${u.num}.png" alt=""><div class="stat-unit"><div class="stat-value"><span>${esc(u.name)} <small>${u.star}★</small></span><strong title="${value.toFixed(3)}">${format(value)}</strong></div><div class="stat-track" aria-hidden="true"><span class="${target==='a'?'stat-home':'stat-away'}" style="width:${value/maximum*100}%"></span></div></div></li>`).join('');}
}
function hex(x,y,r){ctx.beginPath();for(let i=0;i<6;i++){const t=Math.PI/3*i+Math.PI/6;const px=x+Math.cos(t)*r,py=y+Math.sin(t)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();}
function draw(){
 if(!ctx)return;const style=getComputedStyle(document.documentElement),home=style.getPropertyValue('--home').trim(),away=style.getPropertyValue('--away').trim(),ink=style.getPropertyValue('--ink').trim();
 ctx.clearRect(0,0,840,780);ctx.fillStyle=style.getPropertyValue('--bg').trim();ctx.fillRect(0,0,840,780);
 for(let cell=0;cell<56;cell++){const p=xy(cell);hex(p.x,p.y,47);ctx.fillStyle=Math.floor(cell/7)<4?'rgba(230,170,150,.045)':'rgba(201,223,160,.045)';ctx.fill();ctx.strokeStyle=style.getPropertyValue('--line').trim();ctx.lineWidth=1;ctx.stroke();}
 ctx.setLineDash([5,8]);ctx.strokeStyle=style.getPropertyValue('--line').trim();ctx.beginPath();ctx.moveTo(24,376);ctx.lineTo(816,376);ctx.stroke();ctx.setLineDash([]);
 if(!replay){ctx.fillStyle=ink;ctx.font='16px "DM Sans"';ctx.textAlign='center';ctx.fillText('Recorded battle',420,365);return;}
 let frame=replay.frames[0],next=frame;for(let i=0;i<replay.frames.length;i++){if(replay.frames[i][0]<=clock){frame=replay.frames[i];next=replay.frames[Math.min(i+1,replay.frames.length-1)];}else break;}
 const alpha=next[0]>frame[0]?(clock-frame[0])/(next[0]-frame[0]):0,yourTeam=reversed?1-replay.side:replay.side,positions=new Map(),states=[];
 const position=(f,offset)=>{const from=xy(f[offset+1]),to=xy(f[offset]),t=Math.max(0,Math.min(1,f[offset+2]/100));return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};};
 for(let i=0;i<replay.units.length;i++){const base=replay.units[i],change=(replay.changes??[]).filter(c=>c.uid===base.uid&&c.t<=clock).at(-1),u=change?{...base,...change}:base,offset=1+i*8,p=position(frame,offset),q=position(next,offset),pos={x:p.x+(q.x-p.x)*alpha,y:p.y+(q.y-p.y)*alpha};if(frame[offset+6]===0)continue;positions.set(u.uid,pos);states.push({u,offset,pos});}
 const recent=replay.events.filter(e=>e.t<=clock&&e.t>=clock-.45);
 for(const e of recent){if(!['attack','cast','charge'].includes(e.k))continue;const p=positions.get(e.src),q=positions.get(e.dst);if(!p)continue;ctx.globalAlpha=Math.max(.1,1-(clock-e.t)/.45);ctx.strokeStyle=e.k==='attack'?'#e9dcad':'#f8cd72';ctx.lineWidth=e.k==='attack'?2:4;ctx.beginPath();if(q){ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}if(e.k==='cast'){ctx.beginPath();ctx.arc(p.x,p.y,37+(clock-e.t)*40,0,Math.PI*2);ctx.stroke();for(const cell of e.cells??[]){const c=xy(cell);hex(c.x,c.y,39);ctx.fillStyle='rgba(248,205,114,.14)';ctx.fill();}}ctx.globalAlpha=1;}
 for(const {u,offset,pos:p} of states){
  const color=u.team===yourTeam?home:away;ctx.fillStyle=color+'20';ctx.strokeStyle=color;ctx.lineWidth=u.carry?3:1.5;ctx.beginPath();ctx.arc(p.x,p.y,30,0,Math.PI*2);ctx.fill();ctx.stroke();
  const img=imageCache.get(u.num);if(img?.complete&&img.naturalWidth){ctx.imageSmoothingEnabled=false;ctx.drawImage(img,p.x-26,p.y-27,52,43);}else{ctx.fillStyle=ink;ctx.font='10px "DM Sans"';ctx.textAlign='center';ctx.fillText(u.name.slice(0,9),p.x,p.y);}
  ctx.fillStyle='#101914';ctx.fillRect(p.x-29,p.y+19,58,6);ctx.fillStyle=color;ctx.fillRect(p.x-29,p.y+19,58*Math.min(1,frame[offset+3]/u.maxHp),6);
  ctx.fillStyle='#101914';ctx.fillRect(p.x-29,p.y+27,58,3);ctx.fillStyle='#8abbd9';ctx.fillRect(p.x-29,p.y+27,58*Math.min(1,frame[offset+4]/(u.maxMana||1)),3);
  if(frame[offset+5]>0){ctx.strokeStyle='#b7dff1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,34,0,Math.PI*2);ctx.stroke();}
  ctx.fillStyle=ink;ctx.font='10px "DM Sans"';ctx.textAlign='center';ctx.fillText(u.name,p.x,p.y+43);
  if(frame[offset+7]){ctx.fillStyle='#f7cd77';ctx.font='bold 10px "DM Sans"';const flags=frame[offset+7],labels=['STUN','FREEZE','FEAR','AIR','PAR','POISON','BURN','HIDDEN','ROOT'].filter((_,i)=>flags&2**i);ctx.fillText(labels.join(' / '),p.x,p.y-33);}
 }
 for(const e of recent){if(!['dmg','heal'].includes(e.k))continue;const p=positions.get(e.uid);if(!p)continue;ctx.globalAlpha=Math.max(.1,1-(clock-e.t)/.45);ctx.fillStyle=e.k==='heal'?'#b7e6a3':e.eff>1?'#ffb69a':'#f5eedc';ctx.font='bold 15px "DM Sans"';ctx.textAlign='center';ctx.fillText((e.k==='heal'?'+':'−')+Math.round(e.amount),p.x,p.y-34-(clock-e.t)*35);ctx.globalAlpha=1;}
 $('#clock').textContent=`${clock.toFixed(1)} / ${replay.duration.toFixed(1)}s`;$('#scrub').value=clock;
 $('#battle-outcome').textContent=clock>=replay.duration?(replay.winner===-1?'Draw':replay.winner===yourTeam?'Your team won':'Opponent won'):'';
 const items=[...$('#events').children];let active=-1;for(let i=0;i<items.length;i++)if(Number(items[i].dataset.eventTime)<=clock)active=i;items.forEach((li,i)=>li.classList.toggle('active',i===active));
 if(Math.abs(clock-lastUnitUpdate)>.15||clock===0){lastUnitUpdate=clock;$('#unit-state').innerHTML=replay.units.map((base,i)=>{const change=(replay.changes??[]).filter(c=>c.uid===base.uid&&c.t<=clock).at(-1),u=change?{...base,...change}:base,o=1+i*8;return `<div class="unit-state ${u.team===yourTeam?'home-text':'away-text'}">${esc(u.name)} ${u.star}★ / ${frame[o+6]?`${frame[o+3]} / ${Math.round(u.maxHp)} HP / ${frame[o+4]} / ${u.maxMana} energy`:'Eliminated'}</div>`;}).join('');}
 drawCharts();
}
function tick(time){if(!playing||!replay)return;if(lastTick)clock=Math.min(replay.duration,clock+(time-lastTick)/1000*Number($('#speed').value));lastTick=time;draw();if(clock>=replay.duration)stop();else raf=requestAnimationFrame(tick);}
$('#play').onclick=()=>{if(!replay)return;if(playing){stop();return;}if(clock>=replay.duration)clock=0;playing=true;lastTick=0;$('#play').textContent='Ⅱ Pause';$('#play').setAttribute('aria-label','Pause replay');raf=requestAnimationFrame(tick);};
$('#restart').onclick=()=>{stop();clock=0;lastUnitUpdate=-1;draw();};$('#scrub').oninput=e=>{stop();clock=Number(e.target.value);lastUnitUpdate=-1;draw();};
$('#events').onclick=e=>{const button=e.target.closest('[data-event]');if(!button||!replay)return;stop();clock=replay.events[Number(button.dataset.event)].t;lastUnitUpdate=-1;if(matchMedia('(max-width:850px)').matches)selectView('replay');draw();};
$('#replay-select').onchange=e=>setReplay(Number(e.target.value));$('#level').onchange=chooseLevel;
$('.stat-tabs').onclick=e=>{const button=e.target.closest('[data-stat]');if(!button)return;statMetric=button.dataset.stat;for(const tab of document.querySelectorAll('[data-stat]'))tab.setAttribute('aria-pressed',String(tab===button));lastChartKey='';drawCharts();};
$('#stat-scope').onchange=()=>{lastChartKey='';drawCharts();};
$('#team-a').onchange=()=>{ensureDifferent('a');render();};$('#team-b').onchange=()=>{ensureDifferent('b');render();};
$('#swap').onclick=()=>{const id=$('#team-a').value;$('#team-a').value=$('#team-b').value;$('#team-b').value=id;render();};
$('#counter-list').onclick=e=>{const button=e.target.closest('[data-opponent]');if(!button)return;$('#team-b').value=button.dataset.opponent;render();};
function selectView(view){$('.workspace').dataset.view=view;for(const button of document.querySelectorAll('[data-view]')){if(button.tagName==='BUTTON')button.setAttribute('aria-pressed',String(button.dataset.view===view));}for(const panel of document.querySelectorAll('[data-panel]'))panel.hidden=panel.dataset.panel!==(view==='replay'?'stats':view);$('.detail-panel').scrollTop=0;drawCharts();}
$('.detail-tabs').onclick=e=>{const button=e.target.closest('button[data-view]');if(button)selectView(button.dataset.view);};
matchMedia('(min-width:851px)').addEventListener('change',e=>{if(e.matches&&$('.workspace').dataset.view==='replay')selectView('stats');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
async function init(){try{const response=await fetch('analysis/matchups.json');if(!response.ok)throw Error('Matchup data unavailable');data=await response.json();const params=new URLSearchParams(location.hash.slice(1));$('#level').value=params.get('level')==='8'?'8':'9';
 $('#lab').hidden=false;$('#status').textContent='';chooseLevel();if(params.get('view')==='replay')selectView('replay');
 }catch(e){$('#status').textContent='Could not load matchups. Reload to try again.';}}
init();
document.fonts.ready.then(()=>draw());
