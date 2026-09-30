import * as universal from '../entries/pages/about/_page.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/about/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/about/+page.ts";
export const imports = ["_app/immutable/nodes/3.DvSzokj7.js","_app/immutable/chunks/BbpNz1p5.js","_app/immutable/chunks/2TU3FloQ.js","_app/immutable/chunks/D-3Bzmm_.js","_app/immutable/chunks/C_tEcc_T.js"];
export const stylesheets = ["_app/immutable/assets/Section.fGznzVEy.css"];
export const fonts = [];
