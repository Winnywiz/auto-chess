(() => {
  'use strict';
  const D=window.KANTO_SEALS,byId=new Map(D.seals.map(s=>[s.id,s]));
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const kinds={core:'Core synergy',economy:'Economy/tempo',situational:'Situational'};
  function resolve(id){const parts=id.split(':'),[key,type]=parts,s=byId.get(key);if(parts.length>2||!s||(type&&(!s.template||!s.types.includes(type))))return null;return {...s,type,name:type?s.name.replace('Trait',type):s.name,description:s.description.replaceAll('{T}',type??'the chosen type')};}
  function pixel(key,cls=''){const index=D.art.index[key];if(index===undefined)return '';return `<span class="seal-pixel ${cls}" style="--atlas-x:${index%D.art.columns};--atlas-y:${Math.floor(index/D.art.columns)}" aria-hidden="true"></span>`;}
  function icon(id,size=32){const s=resolve(id);if(!s)return '';const tier=s.template?s.id.split('-')[1]:null,key=s.hero?'hero:'+s.id:tier?(s.type?'type:'+s.type:'tier:'+tier):D.art.index['doc:'+s.id]!==undefined?'doc:'+s.id:'g:'+s.id;if(D.art.index[key]===undefined)throw Error('Missing Seal artwork: '+id);return `<span class="seal-emblem rarity-${s.rarity}" style="--seal-size:${size}px" aria-hidden="true"><span class="seal-emblem-well">${pixel(key)}</span>${tier&&s.type?pixel('tier:'+tier,'seal-pixel-badge'):''}</span>`;}
  function tag(id,extra='',size=32){const s=resolve(id);return s?`<button type="button" class="seal-tag rarity-${s.rarity} ${extra}" data-seal="${esc(id)}" aria-haspopup="dialog" aria-label="${esc(s.name)}">${icon(id,size)}<span>${esc(s.name)}</span></button>`:'';}
  function iconButton(id,main=false){const s=resolve(id);return `<button type="button" class="seal-icon-button rarity-${s.rarity} ${main?'seal-primary-icon':''}" data-seal="${esc(id)}" aria-haspopup="dialog" aria-label="${esc(s.name)}">${icon(id,main?48:34)}</button>`;}
  function sidebar(id,cap){const plan=D.recommendations[id]?.[cap];return plan?`<aside class="comp-seals" aria-label="Recommended Seals"><div class="seal-section-title"><h3>Seals</h3><a href="seals.html" aria-label="Open Seal database">Database ↗</a></div>${plan.picks.map((p,k)=>`<section class="seal-side-round"><header><b>${p.round}</b><span class="seal-rarity rarity-${k+1}">${D.rarities[k]}</span></header><div class="seal-side-primary">${iconButton(p.id,true)}<span class="seal-kind ${p.kind}">${kinds[p.kind]}</span></div><div class="seal-side-alternatives" aria-label="${p.round} alternatives">${plan.alternatives[k].map(a=>iconButton(a.id)).join('')}</div></section>`).join('')}</aside>`:'';}
  window.KantoSeals={sidebar,resolve,icon};
  const condition=n=>{
    const names={tank:'Tank',fighter:'Fighter',assassin:'Assassin',marksman:'Marksman',mage:'Mage',support:'Support',special:'Special'};
    switch(n.k){
      case 'levelBelow':return 'Level below '+n.v;
      case 'levelAtLeast':return 'Level '+n.v+' or higher';
      case 'hpAbove':return 'More than '+n.v+' player HP';
      case 'goldAtLeast':return 'At least '+n.v+' gold';
      case 'beforeRound':return 'Before '+Math.floor(n.v/10)+'-'+n.v%10;
      case 'traitActive':return n.type+' trait active';
      case 'typeReach':return 'Matching type owned or reachable';
      case 'anyTrait':return 'An active trait';
      case 'hasWeather':return 'A weather Seal already chosen';
      case 'roleAtLeast':return 'Own '+n.v+' '+n.role.map(r=>names[r]).join(' / ')+' Pokémon';
      case 'rolesAtLeast':return 'Own at least '+n.v+' different role groups';
      case 'typeLines':return 'Own '+n.v+' lines of one type';
      case 'unitBelowCost':return 'Own a Pokémon costing less than '+n.v;
      case 'heroReach':return 'Matching hero owned or reachable; shared pool availability applies';
      default:return '';
    }
  };
  const dialog=document.createElement('dialog');dialog.id='seal-dialog';dialog.setAttribute('aria-labelledby','seal-title');
  document.body.append(dialog);
  const tip=document.createElement('div');tip.id='seal-tooltip';tip.className='seal-tooltip';tip.hidden=true;tip.setAttribute('role','tooltip');document.body.append(tip);
  let openedBy=null;
  function detail(id){const s=resolve(id);if(!s)return;const conditions=(s.needs??[]).map(condition).filter(Boolean),roles=[...new Set(s.effects.flatMap(e=>e.f?.role??[]))];
    dialog.innerHTML=`<div class="seal-dialog-head"><div class="seal-dialog-title">${icon(id,64)}<div><span class="seal-rarity rarity-${s.rarity}">${D.rarities[s.rarity-1]} / ${s.round}</span><h2 id="seal-title">${esc(s.name)}</h2></div></div><button type="button" data-seal-close aria-label="Close Seal details">×</button></div><p class="seal-effect">${esc(s.description)}</p>${s.details.map(text=>`<p class="seal-rule">${esc(text)}</p>`).join('')}${s.effects.some(e=>e.once==='unit')?'<p class="seal-rule">Once per Pokémon.</p>':''}${roles.length?`<p class="seal-rule">Applies to: ${roles.map(esc).join(', ')}</p>`:''}${s.template?`<div class="seal-types" aria-label="Seal type">${s.types.map(t=>`<button type="button" data-seal-type="${s.id}:${t}" aria-pressed="${s.type===t}">${esc(t)}</button>`).join('')}</div>`:''}${conditions.length?`<h3>Offer requirements</h3><ul>${conditions.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}${s.heroLines.length?`<h3>Hero lines</h3><div class="seal-hero-lines">${s.heroNames.map(name=>`<span>${esc(name)}</span>`).join('')}</div>`:''}${s.excl?`<p class="seal-rule">One ${esc(({wide:'wide-team',front:'front-row',parts:'component reward',shiny:'Shiny shop',size:'board size','xp-round':'XP per round'})[s.excl]??s.excl)} Seal per path.</p>`:''}<div class="seal-dialog-footer"><span>${esc(s.category)}</span><a href="seals.html#seal=${encodeURIComponent(id)}">Open in database ↗</a></div>`;
  }
  function open(id,target){openedBy=target;tip.hidden=true;detail(id);if(!dialog.open)dialog.showModal();}
  dialog.addEventListener('click',e=>{if(e.target.closest('[data-seal-close]'))dialog.close();const b=e.target.closest('[data-seal-type]');if(b){detail(b.dataset.sealType);dialog.querySelector(`[data-seal-type="${b.dataset.sealType}"]`)?.focus();}if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>openedBy?.focus({preventScroll:true}));
  document.addEventListener('click',e=>{const b=e.target.closest('[data-seal]');if(b){e.preventDefault();open(b.dataset.seal,b);}});
  function preview(target){if(dialog.open)return;const s=resolve(target.dataset.seal);if(!s)return;tip.innerHTML=`<div class="seal-tooltip-heading">${icon(s.id+(s.type?':'+s.type:''),48)}<div><span class="seal-rarity rarity-${s.rarity}">${s.round} / ${D.rarities[s.rarity-1]}</span><strong>${esc(s.name)}</strong></div></div><p>${esc(s.description)}</p>`;tip.hidden=false;target.setAttribute('aria-describedby','seal-tooltip');const r=target.getBoundingClientRect();tip.style.left=Math.max(10,Math.min(innerWidth-tip.offsetWidth-10,r.left))+'px';tip.style.top=Math.max(10,Math.min(innerHeight-tip.offsetHeight-10,r.bottom+8))+'px';}
  document.addEventListener('pointerover',e=>{const b=e.target.closest('[data-seal]');if(b)preview(b);});
  document.addEventListener('pointerout',e=>{const b=e.target.closest('[data-seal]');if(b&&!b.contains(e.relatedTarget))tip.hidden=true;});
  document.addEventListener('focusin',e=>{if(e.target.matches('[data-seal]'))preview(e.target);});
  document.addEventListener('focusout',()=>tip.hidden=true);window.addEventListener('scroll',()=>tip.hidden=true,{passive:true});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')tip.hidden=true;});
  if(!document.getElementById('seal-directory'))return;
  let search='',category='';const container=document.getElementById('seal-directory'),chips=document.getElementById('seal-categories'),input=document.getElementById('seal-search');
  const short={'Experience and leveling':'Leveling','Shop and rolling':'Shop & rolling','Risk and tradeoffs':'Risk','Delayed rewards':'Delayed rewards','Combat and abilities':'Combat','Weather and terrain':'Weather','Type-specific combat':'Type combat','Unit roles':'Roles','Board positioning':'Positioning','Traits and rules':'Traits','Hero Seals':'Hero'};
  const order=new Map(D.categories.map((c,i)=>[c,i])),haystack=new Map(D.seals.map(s=>[s.id,[s.name,s.id,s.description,s.category,...s.heroLines,...s.heroNames,...(s.types??[])].join(' ').toLowerCase()]));
  chips.innerHTML=['',...D.categories].map(c=>`<button type="button" data-category="${esc(c)}" aria-pressed="false"${c?` title="${esc(c)}"`:''}>${esc(c?short[c]??c:'All')}<small></small></button>`).join('');
  function render(){const searched=D.seals.filter(s=>haystack.get(s.id).includes(search)),filtered=searched.filter(s=>!category||s.category===category);
    document.getElementById('seal-count').textContent=(filtered.length===D.seals.length?'':filtered.length+' / ')+D.seals.length+' Seals';
    for(const b of chips.children){const c=b.dataset.category,n=c?searched.filter(s=>s.category===c).length:searched.length;b.querySelector('small').textContent=n;b.setAttribute('aria-pressed',String(c===category));b.classList.toggle('empty',!n);}
    container.innerHTML=D.rarities.map((name,i)=>{const r=i+1,found=filtered.filter(s=>s.rarity===r).sort((a,b)=>order.get(a.category)-order.get(b.category)||a.name.localeCompare(b.name));return found.length?`<section class="seal-tier" aria-labelledby="seal-tier-${r}"><header><h2 id="seal-tier-${r}" class="seal-rarity rarity-${r}">${esc(name)}</h2><span>Round ${D.rounds[i]} · ${found.length}</span></header><div class="seal-tag-cloud">${found.map(s=>tag(s.id,'',22)).join('')}</div></section>`:'';}).join('')||'<p class="seal-empty">No Seals found. Try another search or category.</p>';
  }
  input.addEventListener('input',e=>{search=e.target.value.trim().toLowerCase();render();});
  chips.addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;const c=b.dataset.category;category=c&&c===category?'':c;render();});
  const picker=document.getElementById('theme');function theme(t){document.documentElement.dataset.theme=t;picker.value=t;document.querySelector('meta[name="theme-color"]').content=t==='pallet'?'#171f30':'#101914';}
  let saved;try{saved=localStorage.getItem('kanto-theme');}catch{}theme(saved==='pallet'?'pallet':'viridian');picker.onchange=()=>{theme(picker.value);try{localStorage.setItem('kanto-theme',picker.value);}catch{}};
  render();
  function hash(){const id=new URLSearchParams(location.hash.slice(1)).get('seal');if(id&&resolve(id)){const s=resolve(id);category='';search='';input.value='';render();open(id,container.querySelector(`[data-seal="${s.id}"]`));}}
  window.addEventListener('hashchange',hash);hash();
})();
