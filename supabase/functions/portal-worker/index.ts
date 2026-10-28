// Test-only activation first. No change to existing blog worker, Vault or schedules.
import {createWorker} from '../_shared/portal.mjs';
export default {fetch:createWorker((name:string)=>Deno.env.get(name))};
