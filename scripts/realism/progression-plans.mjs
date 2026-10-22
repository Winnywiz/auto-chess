// Editorial progression overrides. These suggested boards have no inherited combat score.
export function applyProgressionPlans(rows,comps){
  const guide=rows['v34-search-2'];
  const carryItems=['choice-specs','focus-sash','quick-claw'];
  const tankItems=['focus-sash','leftovers','leftovers'];
  const unit=(line,star,cell,items=[],assignment)=>({line,star,cell,items:[...items],...(assignment?{assignment}:{})});
  const makeSeven=()=>{
    const team=[unit('paras',2,28,tankItems,'Tank'),unit('bulbasaur',2,29),unit('slowpoke',2,31),
      unit('staryu',1,49),unit('abra',2,50),unit('exeggcute',2,52,carryItems,'Carry'),unit('jynx',2,55)];
    const note='Complete Psychic 5, Grass 3 and Water 2. Roll at 7 mainly for Exeggutor 3★; use Exeggutor 2★ while waiting. Keep Ivysaur, Parasect and Slowbro at 2★. Use Staryu until Starmie is ready.';
    return {key:'level-7',level:7,team,note,suggested:true,
      holders:[{holder:'paras',holderStar:2,target:'paras',targetStar:2,items:[...tankItems],keep:true},
        {holder:'exeggcute',holderStar:2,target:'exeggcute',targetStar:3,items:[...carryItems],keep:true}]};
  };
  // Restore the exact eight-unit link supplied by the user. Only Golduck's slot changes.
  const eight=[unit('paras',2,28,tankItems,'Tank'),unit('bulbasaur',2,29),unit('ditto',2,33),
    unit('staryu',2,49),unit('abra',2,50),unit('exeggcute',2,52,carryItems,'Carry'),
    unit('chansey',2,53),unit('mewtwo',1,54)];
  // The original nine-unit cap is restored with the same one-slot healer replacement.
  const nine=comps.rows.find(r=>r.id==='v34-search-2').boards.find(b=>b.level===9).team.map(u=>({...u,line:u.line==='psyduck'?'chansey':u.line,items:[...u.items]}));
  const restored=(level,team)=>({key:'level-'+level,level,team,suggested:true,
    note:'Use the supplied formation and equipment. Golduck is replaced by Chansey; all other units and stars stay as shown.',
    holders:team.filter(u=>u.items.length).map(u=>({holder:u.line,holderStar:u.star,target:u.line,targetStar:u.star,items:[...u.items],keep:true}))});
  guide.plan='Use the supplied Exeggutor and Parasect formation. Replace Golduck with Chansey; keep the other units, stars, items and positions shown.';
  guide.stop='Exeggutor holds the carry items. Parasect holds Focus Sash and two Leftovers.';
  guide.stages=[...guide.stages.filter(s=>s.level<7),makeSeven(),restored(8,eight),restored(9,nine)];
}
