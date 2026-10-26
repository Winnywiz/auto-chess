import {roster,family} from './combat.mjs';
// Native v37 _e / he: an anchored stage index must have unlocked at star - 1.
export const minimumFormStar=line=>roster[line]?.anchorK?Number(line.match(/-a(\d)$/)[1])+1:roster[line]?.branchOf==='eevee'?2:1;
export const availableForm=(line,star)=>star<minimumFormStar(line)?family(line):line;
export const legalForm=(line,star)=>availableForm(line,star)===line;
