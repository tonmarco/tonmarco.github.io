import * as universal from '../entries/pages/keynotes/_page.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/keynotes/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/keynotes/+page.ts";
export const imports = ["_app/immutable/nodes/7.CRZuEVZw.js","_app/immutable/chunks/BbpNz1p5.js","_app/immutable/chunks/2TU3FloQ.js","_app/immutable/chunks/CnunN4rP.js","_app/immutable/chunks/D-3Bzmm_.js","_app/immutable/chunks/C_tEcc_T.js"];
export const stylesheets = ["_app/immutable/assets/Section.fGznzVEy.css"];
export const fonts = [];
