import {states as base,excludedStates as excluded,roster} from './experiment.mjs';
const eevee=roster.find(r=>r.id==='eevee');
export const additionalStates=[2,3].map(star=>({line:'eevee',star,name:eevee.forms[star-1].name,role:eevee.role,traits:eevee.traits}));
export const states=[...base,...additionalStates];
export const excludedStates=excluded.filter(s=>s.line!=='eevee');
