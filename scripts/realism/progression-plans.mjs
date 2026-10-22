// Editorial progression overrides. These suggested boards have no inherited combat score.
export function applyProgressionPlans(rows){
  const guide=rows['v34-search-2'];
  const carryItems=['choice-specs','focus-sash','quick-claw'];
  const tankItems=['focus-sash','leftovers','leftovers'];
  const unit=(line,star,cell,items=[],assignment)=>({line,star,cell,items:[...items],...(assignment?{assignment}:{})});
  const makeStage=level=>{
    const team=[unit('paras',2,28,tankItems,'Tank'),unit('bulbasaur',2,29),unit('slowpoke',2,31),
      unit('staryu',level===7?1:2,49),unit('abra',2,50),unit('exeggcute',2,52,carryItems,'Carry'),unit('jynx',2,55)];
    if(level>=8)team.push(unit('chansey',2,53));
    if(level===9){
      team.push(unit('ditto',2,33));
      for(const u of team){if(u.line==='abra'){u.line='mew';u.star=1;}else if(u.line==='jynx'){u.line='mewtwo';u.star=1;}}
    }
    const note=level===7
      ?'Complete Psychic 5, Grass 3 and Water 2. Roll at 7 mainly for Exeggutor 3★; use Exeggutor 2★ while waiting. Keep Ivysaur, Parasect and Slowbro at 2★. Use Staryu until Starmie is ready.'
      :level===8
      ?'Add Chansey. Replace Kadabra 2★ with Mew 1★ and Jynx 2★ with Mewtwo 1★ as soon as they appear. Both swaps keep Psychic 5. Keep the carry items on Exeggutor and the tank items on Parasect.'
      :'Add Ditto alongside Chansey for Normal 2. Use Mew 1★ and Mewtwo 1★ immediately when found; keep Kadabra and Jynx only while waiting. Preserve Psychic 5, Grass 3 and Water 2. Keep any Exeggutor 3★ already completed.';
    return {key:'level-'+level,level,team,note,suggested:true,
      ...(level===9?{defaultLegendSwaps:{mew:true,mewtwo:true}}:{}),
      holders:[{holder:'paras',holderStar:2,target:'paras',targetStar:2,items:[...tankItems],keep:true},
        {holder:'exeggcute',holderStar:2,target:'exeggcute',targetStar:3,items:[...carryItems],keep:true}]};
  };
  guide.plan='Build Psychic 5 around Exeggutor, with Parasect and Ivysaur completing Grass 3. Prioritize Exeggutor 3★ at 7. Add Chansey at 8, then Ditto at 9. Replace Kadabra with Mew 1★ and Jynx with Mewtwo 1★ immediately when found.';
  guide.stop='Keep support units at 2★ rather than chasing several three-stars. After Exeggutor upgrades, level; if the chase stalls, use the 2★ bridge and strengthen the board. Do not wait for legendary 2★ before making the swaps.';
  guide.legendSwaps=[{from:'abra',fromStar:2,to:'mew',toStar:1},{from:'jynx',fromStar:2,to:'mewtwo',toStar:1}];
  guide.stages=[...guide.stages.filter(s=>s.level<7),...[7,8,9].map(makeStage)];
}
