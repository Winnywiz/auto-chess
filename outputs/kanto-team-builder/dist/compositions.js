(() => {
  'use strict';
  const D=window.KANTO_DATA,L=window.TeamLogic,C=window.KANTO_COMPS,$=s=>document.querySelector(s);
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const media=p=>window.KANTO_MEDIA?.[p]??'media/'+p;
  const percent=x=>(x*100).toFixed(1)+'%';
  const pp=x=>(x>=0?'+':'')+(x*100).toFixed(1)+' pp';
  const form=u=>L.lines[u.line].forms[u.star-1];
  let strategy='',query='',tier='',dependent=false;
  const levels=new Map();
  function theme(t){document.documentElement.dataset.theme=t;$('#theme-picker').value=t;document.querySelector('meta[name="theme-color"]').content=t==='pallet'?'#171f30':'#101914';}
  theme(document.documentElement.dataset.theme);
  $('#theme-picker').onchange=e=>{theme(e.target.value);try{localStorage.setItem('kanto-theme',e.target.value);}catch{}};
  if(!C?.rows?.length){$('#run-summary').textContent='Composition search is running.';$('#method-summary').textContent='Results will appear after the new-item BIS run and composition confirmation finish.';return;}
  const rows=C.rows;
  $('#run-summary').textContent=`${rows.length} tested paths / tiers within each strategy`;
  $('#method-summary').textContent=`${C.battles.toLocaleString()} native battles across search and confirmation. Each stage faces every other published board in its strategy with 32 seeds and both sides. Carry gear comes from the updated BIS run. Core Pokémon remain on every later board; stars may upgrade.`;
  $('#source-build').textContent=`Source: ${D.build}. Captured ${C.capturedDate}. No weather or boons. These scores are conditional on the tested opponents, formations and equipment.`;
  const byId=Object.fromEntries(rows.map(r=>[r.id,r]));
  const item=(id,size='')=>`<span class="comp-item ${size}" tabindex="0" data-hover-item="${esc(id)}" aria-label="${esc(L.items[id].name)}"><img src="${media('items/'+id+'.png')}" alt="" loading="lazy"></span>`;
  function unit(u,carry=false){return `<span class="comp-unit ${carry?'carry':''}"><span class="comp-stars" aria-label="${u.star} stars">${'★'.repeat(u.star)}</span><span class="comp-unit-image" tabindex="0" data-hover-unit='${esc(JSON.stringify(u))}' aria-label="${esc(form(u).name)} skill"><img src="${media('icons/'+form(u).num+'.png')}" alt="${esc(form(u).name)}" loading="lazy"></span><span class="comp-items">${u.items.map(id=>item(id)).join('')}</span><span class="comp-unit-name">${esc(form(u).name)}</span></span>`;}
  function traits(team){const board=Object.fromEntries(team.map((u,i)=>[i,u]));return L.traits(board).filter(t=>t.active).sort((a,b)=>b.tier-a.tier||b.count-a.count).map(t=>`<span class="comp-trait" title="${esc(t.name+': '+t.desc.replace('{v}',t.value))}"><img src="${media('types/'+t.name.toLowerCase()+'.png')}" alt="${esc(t.name)}"><b>${t.count}</b></span>`).join('');}
  function teamPayload(board){return {v:1,level:board.level,nextId:board.team.length+1,mode:'sprite',board:Object.fromEntries(board.team.map((u,i)=>[u.cell-28,{id:i+1,line:u.line,star:u.star,items:u.items}])),bench:Array(9).fill(null)};}
  function builderLink(board){return 'index.html#team='+btoa(unescape(encodeURIComponent(JSON.stringify(teamPayload(board)))));}
  function boardMarkup(r,level){
    const board=r.boards.find(b=>b.level===level),score=r.stages.find(s=>s.level===level),map=new Map(board.team.map(u=>[u.cell,u]));
    return `<div class="level-tabs" aria-label="Progression levels">${r.boards.map(b=>`<button data-level="${b.level}" data-id="${r.id}" class="${level===b.level?'active':''}" aria-pressed="${level===b.level}">Level ${b.level}</button>`).join('')}</div><div class="mini-board" aria-label="Level ${level} formation">${[4,5,6,7].map(row=>`<div class="mini-board-row">${[0,1,2,3,4,5,6].map(col=>{const u=map.get(row*7+col);return `<span class="mini-hex" ${u?`tabindex="0" data-hover-unit='${esc(JSON.stringify(u))}' aria-label="${esc(form(u).name)}, ${u.star} stars"`:''}>${u?`<img src="${media('icons/'+form(u).num+'.png')}" alt="${esc(form(u).name)}"><span class="mini-star">${'★'.repeat(u.star)}</span>`:''}</span>`;}).join('')}</div>`).join('')}</div><div class="stage-score"><b>${percent(score.score)}</b> battle score / ${score.n} battles</div><p class="stage-change">${level===r.boards[0].level?'Core board.':`Add <b>${esc(board.team.slice(r.boards.find(b=>b.level===level-1)?.team.length??0).map(u=>form(u).name).join(', '))}</b>. Keep the existing core.`}</p><a class="load-comp" href="${builderLink(board)}">Open level ${level} in builder ↗</a>`;
  }
  function details(r){
    const first=r.boards[0],last=r.boards.at(-1),isReroll=r.category.startsWith('reroll'),carry=last.team[0],budget={};
    for(const u of last.team)for(const id of u.items)for(const part of L.items[id].parts)budget[part]=(budget[part]??0)+1;
    const carryName=form(carry).name;
    const targets=first.team.filter(u=>u.star===3).map(u=>form(u).name).join(' + ');
    const plan=isReroll?`Roll at level <strong>${first.level}</strong> for <strong>${esc(targets)} 3★</strong>. Keep the core after the upgrades; add the listed supports as you level.`:r.category==='fast-8'?`Use the level 7 board as a bridge. Target level <strong>8</strong> and <strong>${esc(carryName)} 2★</strong>. Upgrade the carry and add the final support.`:`Target level <strong>9</strong>. The level 8 board uses <strong>${esc(carryName)} 1★</strong>; the final board assumes <strong>2★</strong>. This is an expensive end-board target.`;
    const cost=L.lines[carry.line].cost,rollLevel=isReroll?first.level:last.level,odds=C.shopOdds?.[rollLevel]?.[cost-1];
    const branch=carry.line==='eevee'?'<p>Enable Keep Eevee before merging to preserve the Normal form.</p>':L.lines[carry.line].branchOf?`<p>Eevee’s branch depends on merge items. Establish ${esc(carryName)} before the final gear; a Magnet may be needed.</p>`:'';
    return `<div class="comp-plan"><h3>Game plan</h3><p>${plan}</p>${odds!==undefined?`<p>${cost}-cost shop odds at level ${rollLevel}: <strong>${odds}%</strong>.</p>`:''}${branch}<h3>Keep this core</h3><div class="core-list">${first.team.map(u=>`<span class="core-tag">${esc(form(u).name)}</span>`).join('')}</div><p>Roll timing and hit probability still need full-match testing.</p></div><div class="comp-board-panel" id="board-${r.id}">${boardMarkup(r,levels.get(r.id)??last.level)}</div><div class="comp-resources"><h3>Final component requirements</h3><div class="component-budget">${Object.entries(budget).map(([id,n])=>`<span tabindex="0" data-hover-item="${id}" aria-label="${n} ${esc(L.items[id].name)}"><img src="${media('items/'+id+'.png')}" alt="${esc(L.items[id].name)}">×${n}</span>`).join('')}</div><p>${r.purchaseGold} gold in unit copies, excluding XP and rerolls. Items are assumed available.</p><p class="result-interval">BIS impact: <strong>${pp(r.impact.mean)}</strong><br>Paired interval: ${pp(r.impact.low)} to ${pp(r.impact.high)}<br>${r.battles.toLocaleString()} confirmation battles per gear setup.</p></div>`;
  }
  function render(){
    const matched=rows.filter(r=>(!strategy||r.category===strategy)&&(!tier||r.tier===tier)&&(!dependent||r.bisDependent)&&(!query||[r.name,r.strategy,...r.boards.at(-1).team.flatMap(u=>[u.line,form(u).name,...L.lines[u.line].traits])].join(' ').toLowerCase().includes(query)));
    $('#empty-results').hidden=matched.length>0;
    $('#comps-list').innerHTML=matched.map(r=>{const last=r.boards.at(-1),weakest=Math.min(...r.stages.map(s=>s.score));return `<details class="comp-card tier-${r.tier}" data-comp="${r.id}"><summary class="comp-summary"><div class="comp-title"><span class="tier-badge">${r.tier}</span><div><h2>${esc(r.name)}</h2><span class="strategy-tag ${r.category.startsWith('reroll')?'reroll':'fast'}">${r.category.startsWith('reroll')?'↻':'⇧'} ${esc(r.strategy)}</span>${r.bisDependent?'<span class="bis-tag">BIS dependent</span>':''}</div></div><div class="comp-lineup"><div class="comp-traits">${traits(last.team)}</div><div class="comp-units">${last.team.map((u,i)=>unit(u,i===0)).join('')}</div></div><div class="comp-metric">${percent(r.score)}<small>${r.peers} peer boards</small></div><div class="comp-metric">${percent(weakest)}<small>Weakest stage</small></div><div class="comp-metric impact">${pp(r.impact.mean)}<small>BIS impact</small></div></summary><div class="comp-details">${details(r)}</div></details>`;}).join('');
  }
  $('#strategy-filters').onclick=e=>{const b=e.target.closest('[data-strategy]');if(!b)return;strategy=b.dataset.strategy;for(const el of document.querySelectorAll('[data-strategy]')){el.classList.toggle('active',el===b);el.setAttribute('aria-pressed',el===b);}render();};
  $('#comp-search').oninput=e=>{query=e.target.value.trim().toLowerCase();render();};
  $('#tier-filter').onchange=e=>{tier=e.target.value;render();};
  $('#bis-only').onchange=e=>{dependent=e.target.checked;render();};
  $('#comps-list').onclick=e=>{const b=e.target.closest('[data-level]');if(!b)return;const r=byId[b.dataset.id];levels.set(r.id,+b.dataset.level);$('#board-'+r.id).innerHTML=boardMarkup(r,+b.dataset.level);hide();};
  const tip=$('#skill-tooltip');
  function hide(){tip.hidden=true;}
  function tooltip(target){
    if(target.dataset.hoverItem){const x=L.itemDetails(target.dataset.hoverItem);tip.innerHTML=`<div class="tooltip-pokemon tooltip-item-heading"><img src="${media('items/'+x.id+'.png')}" alt=""><b>${esc(x.name)}</b></div><p>${x.stats.map(esc).join(' / ')}</p><p>${esc(x.effect)}</p>${x.parts.length?`<small>Recipe: ${x.parts.map(id=>esc(L.items[id].name)).join(' + ')}</small>`:''}`;}
    else {const u=JSON.parse(target.dataset.hoverUnit),m=L.skill(u);tip.innerHTML=`<div class="tooltip-pokemon"><img src="${media('icons/'+form(u).num+'.png')}" alt=""><b>${esc(form(u).name)}</b><span>${'★'.repeat(u.star)}</span></div><h3>${esc(m.name)}</h3><small>${esc(m.type)} / ${m.start??0} / ${m.mana} Energy${m.canCrit?' / Ability can crit':''}</small><p>${esc(m.desc||m.tag||'Uses its native skill.')}</p><small>Traits: ${L.lines[u.line].traits.map(esc).join(' / ')}<br>Combat types: ${(form(u).types??[]).map(esc).join(' / ')}</small>`;}
    tip.hidden=false;const rect=target.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.max(10,Math.min(innerWidth-w-10,rect.left))+'px';tip.style.top=Math.max(10,Math.min(innerHeight-h-10,rect.bottom+10))+'px';
  }
  document.addEventListener('pointerover',e=>{const target=e.target.closest('[data-hover-item],[data-hover-unit]');if(target)tooltip(target);});
  document.addEventListener('pointerout',e=>{if(e.target.closest('[data-hover-item],[data-hover-unit]')&&!e.target.closest('[data-hover-item],[data-hover-unit]').contains(e.relatedTarget))hide();});
  document.addEventListener('focusin',e=>{if(e.target.matches('[data-hover-item],[data-hover-unit]'))tooltip(e.target);});
  document.addEventListener('focusout',hide);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});window.addEventListener('scroll',hide,{passive:true});
  render();
})();
