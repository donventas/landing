// Keep Supabase gateway JWT verification enabled in addition to the dedicated key.
import {createIntake} from '../_shared/portal.mjs';
export default {fetch:createIntake((name:string)=>Deno.env.get(name))};
