import {validateRequest} from './simulation/battle-core.js';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
const coord=cell=>'ABCD'[Math.floor((cell-28)/7)]+(cell%7+1);
const itemImage=id=>id.startsWith('emblem-')?'media/types/'+id.slice(7)+'.png':'media/items/'+id+'.png';
export async function initCustomBattle({present,invalidate}){
 let rules=37;
 try{const encoded=new URLSearchParams(location.hash.slice(1)).get('battle');if(encoded&&encoded.length<=16000){const version=JSON.parse(atob(encoded)).rules;if([36,37].includes(version))rules=version;}}catch{}
 const response=await fetch(`simulation/data-v${rules}.json?v=v37-1`);if(!response.ok)throw Error('Combat data unavailable');
 const game=await response.json(),lines=new Map(game.roster.map(r=>[r.id,r]));
 const sorted=[...game.roster].sort((a,b)=>a.cost-b.cost||a.forms[0].name.localeCompare(b.forms[0].name));
 let teams={a:[{line:'vaporeon',star:2,cell:52,items:['choice-specs','focus-sash']},{line:'snorlax',star:2,cell:31,items:['leftovers']}],b:[{line:'kabutops',star:2,cell:31,items:['scope-lens','focus-sash']},{line:'tangela4',star:2,cell:30,items:['rocky-helmet']}]};
 const selected={a:0,b:0};let picking='a',pickCell=null,worker=null,timer=null,generation=0,busy=false,lastResult=null,presets=[];
 const form=u=>lines.get(u.line).forms[u.star-1];
 const request=()=>({rules,...clone(teams),seed:$('#battle-seed').value.trim()===''?NaN:Number($('#battle-seed').value),runs:Number($('#battle-runs').value)});
 const notify=text=>{$('#run-status').textContent=text;};
 function shutdown(){worker?.terminate();worker=null;clearTimeout(timer);timer=null;busy=false;$('#simulate').disabled=false;$('#cancel-simulation').hidden=true;}
 function changed(){generation++;shutdown();invalidate();lastResult=null;$('#download-replay').hidden=true;if(new URLSearchParams(location.hash.slice(1)).has('battle'))history.replaceState(null,'',location.pathname+location.search);notify('Simulate to update the replay.');save();}
 function save(){try{localStorage.setItem(`kanto-custom-v${rules}`,JSON.stringify(request()));}catch{}}
 function restore(value){const q=validateRequest(value,game,{allowEmpty:true});teams={a:q.a,b:q.b};$('#battle-seed').value=q.seed;$('#battle-runs').value=q.runs;}
 try{
  const encoded=new URLSearchParams(location.hash.slice(1)).get('battle');
  if(encoded){if(encoded.length>16000)throw Error('This battle link is too large.');restore(JSON.parse(atob(encoded)));}
  else{const saved=localStorage.getItem(`kanto-custom-v${rules}`);if(saved)restore(JSON.parse(saved));}
 }catch{notify('Could not restore that setup. The example teams are shown.');}
 function renderSide(side){
  const team=teams[side],current=team[selected[side]],letter=side.toUpperCase();
  $('#count-'+side).textContent=team.length+'/9';$('#add-'+side).disabled=team.length>=9;$('#clear-'+side).disabled=!team.length;
  const counts={};for(const line of new Set(team.map(u=>u.line)))for(const t of lines.get(line).traits)counts[t]=(counts[t]??0)+1;
  $('#setup-traits-'+side).innerHTML='<span class="trait-caption" title="Before item effects">Base traits</span>'+Object.entries(counts).filter(([t,n])=>n>=game.traits[t].thresholds[0]).sort((a,b)=>b[1]-a[1]).map(([t,n])=>`<span title="${esc(t)} ${n}"><img src="media/types/${t.toLowerCase()}.png" alt="${esc(t)}">${n}</span>`).join('');
  const cells=Array.from({length:28},(_,i)=>{
   const cell=i+28,index=team.findIndex(u=>u.cell===cell),u=team[index],f=u&&form(u);
   return `<button type="button" class="setup-hex ${u?'occupied':''} ${index===selected[side]?'selected':''}" data-cell="${cell}" data-side="${side}" aria-pressed="${!!u&&index===selected[side]}" aria-label="Team ${letter}, ${coord(cell)}${u?', '+esc(f.name)+', '+u.star+' stars':', empty'}" title="${u?esc(f.name):coord(cell)}">${u?`<img src="media/sprites/${f.num}.gif" alt=""><span class="setup-stars">${'★'.repeat(u.star)}</span><span class="setup-gear">${u.items.map(id=>`<img src="${itemImage(id)}" alt="${esc(game.items.find(i=>i.id===id).name)}">`).join('')}</span>`:`<span class="hex-coordinate">${coord(cell)}</span>`}</button>`;
  });
  $('#board-'+side).innerHTML=Array.from({length:4},(_,row)=>'<div class="setup-row '+(row%2?'offset':'')+'">'+cells.slice(row*7,row*7+7).join('')+'</div>').join('');
  $('#unit-editor-'+side).innerHTML=current?`<div class="selected-unit"><img src="media/icons/${form(current).num}.png" alt=""><b>${esc(form(current).name)}</b><span>${coord(current.cell)}</span><button type="button" data-remove="${side}" aria-label="Remove ${esc(form(current).name)} from team ${letter}">Remove</button></div><div class="unit-settings"><label>Stars<select data-star="${side}" aria-label="Team ${letter} selected Pokémon stars">${[1,2,3].map(n=>`<option value="${n}" ${n===current.star?'selected':''}>${n}★</option>`).join('')}</select></label>${[0,1,2].map(slot=>`<label>Item ${slot+1}<select data-item="${side}" data-slot="${slot}" aria-label="Team ${letter} held item ${slot+1}"><option value="">None</option>${['full','part','emblem'].map(kind=>`<optgroup label="${{full:'Finished items',part:'Components',emblem:'Emblems'}[kind]}">${game.items.filter(i=>i.kind===kind).map(i=>`<option value="${i.id}" ${current.items[slot]===i.id?'selected':''}>${esc(i.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>`).join('')}</div><div class="held-effects">${current.items.map(id=>{const i=game.items.find(i=>i.id===id);return `<span title="${esc(i.name+': '+i.short)}"><img src="${itemImage(id)}" alt=""><span><b>${esc(i.name)}</b> ${esc(i.tiny??i.short??'')}</span></span>`;}).join('')}</div>`:'<p class="empty-team">Add a Pokémon to start.</p>';
 }
 function render(){for(const side of ['a','b'])renderSide(side);$('#setup-summary').textContent=`Teams / ${teams.a.length} vs ${teams.b.length}`;}
 function openUnits(side,cell=null){if(teams[side].length>=9)return;picking=side;pickCell=cell;$('#unit-picker-title').textContent='Add to team '+side.toUpperCase();$('#unit-search').value='';renderUnits();$('#unit-picker').showModal();$('#unit-search').focus();}
 function renderUnits(){
  const query=$('#unit-search').value.trim().toLowerCase(),list=sorted.filter(r=>[...r.forms.map(f=>f.name),...r.traits].join(' ').toLowerCase().includes(query));
  $('#unit-options').innerHTML=list.map(r=>`<button type="button" data-add-line="${r.id}" class="unit-option"><img src="media/sprites/${r.forms[0].num}.gif" alt="" loading="lazy"><span><b>${esc(r.forms[0].name)}</b><small>${r.cost} gold / ${esc(r.traits.join(' / '))}</small></span></button>`).join('');$('#unit-empty').hidden=!!list.length;
 }
 for(const side of ['a','b']){
  $('#add-'+side).onclick=()=>openUnits(side);
  $('#clear-'+side).onclick=()=>{teams[side]=[];selected[side]=-1;changed();render();};
  $('#board-'+side).onclick=e=>{
   const button=e.target.closest('[data-cell]');if(!button)return;const cell=Number(button.dataset.cell),index=teams[side].findIndex(u=>u.cell===cell);
   if(index>=0){selected[side]=index;renderSide(side);return;}
   if(teams[side][selected[side]]){teams[side][selected[side]].cell=cell;changed();renderSide(side);}else openUnits(side,cell);
  };
  $('#unit-editor-'+side).onchange=e=>{
   const u=teams[side][selected[side]];if(!u)return;
   if(e.target.dataset.star)u.star=Number(e.target.value);
   else if(e.target.dataset.item){const slots=[...u.items];slots[Number(e.target.dataset.slot)]=e.target.value;u.items=slots.filter(Boolean);}else return;
   changed();renderSide(side);
  };
  $('#unit-editor-'+side).onclick=e=>{if(!e.target.closest('[data-remove]'))return;teams[side].splice(selected[side],1);selected[side]=teams[side].length?Math.min(selected[side],teams[side].length-1):-1;changed();render();};
  $('#preset-'+side).onchange=e=>{const row=presets.find(r=>r.id===e.target.value);if(!row)return;const board=row.boards[0];teams[side]=clone(board.team).map(({line,star,cell,items})=>({line,star,cell,items}));selected[side]=0;e.target.value='';changed();render();};
  $('#import-'+side).onclick=()=>{
   $('#import-side').value=side;$('#builder-payload').value='';$('#import-error').textContent='';$('#builder-import').showModal();$('#builder-payload').focus();
  };
 }
 $('#unit-options').onclick=e=>{
  const button=e.target.closest('[data-add-line]');if(!button)return;const r=lines.get(button.dataset.addLine),occupied=new Set(teams[picking].map(u=>u.cell));
  const preference=r.range<=2?[31,30,32,29,33,28,34]:[52,53,51,54,50,55,49];
  const cell=pickCell??[...preference,...Array.from({length:28},(_,i)=>i+28)].find(c=>!occupied.has(c));
  teams[picking].push({line:r.id,star:1,items:[],cell});selected[picking]=teams[picking].length-1;changed();render();$('#unit-picker').close();$('#add-'+picking).focus();
 };
 $('#unit-search').oninput=renderUnits;$('#close-units').onclick=()=>$('#unit-picker').close();
 $('#close-import').onclick=()=>$('#builder-import').close();
 $('#apply-import').onclick=()=>{
  try{
   const text=$('#builder-payload').value.trim();if(text.length>20000)throw Error('This setup is too large.');
   const encoded=text.includes('#team=')?text.split('#team=')[1]:text.replace(/^#?team=/,'');
   const payload=JSON.parse(atob(encoded));if(payload.v!==1||!payload.board||Array.isArray(payload.board))throw Error('Paste a builder team link.');
   const team=Object.entries(payload.board).map(([cell,u])=>({line:u.line,star:u.star,items:u.items??[],cell:Number(cell)+28})),side=$('#import-side').value;
   validateRequest({rules,a:team,b:team,seed:0,runs:1},game);teams[side]=team;selected[side]=0;changed();render();$('#builder-import').close();
  }catch(error){$('#import-error').textContent=error.message==='Invalid character'?'Paste a valid builder team link.':error.message;}
 };
 $('#swap-teams').onclick=()=>{teams={a:teams.b,b:teams.a};selected.a=selected.b=0;changed();render();};
 $('#new-seed').onclick=()=>{$('#battle-seed').value=crypto.getRandomValues(new Uint32Array(1))[0];changed();};
 $('#battle-seed').onchange=changed;$('#battle-runs').onchange=changed;
 $('#share-battle').onclick=async()=>{
  try{const q=validateRequest(request(),game),hash='#'+new URLSearchParams({battle:btoa(JSON.stringify(q))});history.replaceState(null,'',hash);await navigator.clipboard.writeText(location.href);notify('Battle link copied.');}
  catch(error){notify(error.name==='NotAllowedError'?'Copy the battle link from the address bar.':error.message);}
 };
 $('#download-replay').onclick=()=>{
  if(!lastResult)return;const url=URL.createObjectURL(new Blob([JSON.stringify(lastResult)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='kanto-v'+lastResult.rules+'-battle-'+lastResult.request.seed+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 $('#cancel-simulation').onclick=()=>{generation++;shutdown();notify('Simulation cancelled.');};
 $('#simulation-form').onsubmit=e=>{
  e.preventDefault();if(busy)return;let q;try{q=validateRequest(request(),game);}catch(error){notify(error.message);return;}
  save();invalidate();lastResult=null;$('#download-replay').hidden=true;busy=true;$('#simulate').disabled=true;$('#cancel-simulation').hidden=false;const id=++generation;notify('Loading combat engine…');
  try{worker=new Worker(new URL('./simulation/battle-worker.js?v=v37-tempo-1',import.meta.url),{type:'module'});}catch{shutdown();notify('This browser could not start the simulator. Try a current browser.');return;}
  timer=setTimeout(()=>{if(id!==generation)return;generation++;shutdown();notify('Simulation timed out. Try fewer fights.');},45000);
  worker.onerror=e=>{if(id!==generation)return;e.preventDefault();shutdown();notify('Could not load the combat engine. Reload to try again.');};
  worker.onmessage=({data:message})=>{
   if(message.id!==generation)return;
   if(message.progress){notify(`Simulating ${message.progress.done}/${message.progress.total} fights…`);return;}
   shutdown();if(message.error){notify(message.error);return;}
   lastResult=message.result;present(lastResult,game);$('#custom-setup').open=false;$('#download-replay').hidden=false;
   notify(lastResult.n===1?'Replay ready.':lastResult.n+' fights complete. Replays show one example per observed result.');
  };
  worker.postMessage({id,request:q});
 };
 window.addEventListener('pagehide',()=>{generation++;shutdown();});
 render();$('#custom-controls').hidden=false;$('#status').textContent='';
 fetch('data/compositions-52.json?v=v37-compared-1').then(r=>{if(!r.ok)throw Error();return r.json();}).then(p=>{
  if(p.engine!==game.identity)return;presets=[...p.rows.map(r=>({...r,name:r.name+' (5-2)'})),...p.reference.map(r=>({...r,name:'Ranked meta: '+r.name}))];for(const side of ['a','b'])$('#preset-'+side).innerHTML='<option value="">Load composition</option>'+presets.map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('');
 }).catch(()=>{for(const side of ['a','b'])$('#preset-'+side).hidden=true;});
}
