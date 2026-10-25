import {parentPort} from 'node:worker_threads';
import {campaign} from '../comps-tempo-v36/campaign.mjs';
import {planTurn} from './policy.mjs';
parentPort.on('message',j=>{try{const g=campaign(j.seed,{plan:j.plan,seat:j.seat??0,trace:!!j.trace,seals:true,cutoff:52,turn:planTurn});if(j.plan)g.players=g.players.filter(p=>p.id===g.controlled);parentPort.postMessage({result:g});}catch(e){parentPort.postMessage({error:e.stack});}});
