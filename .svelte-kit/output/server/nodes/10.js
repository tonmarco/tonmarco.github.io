import * as universal from '../entries/pages/program/_page.ts.js';

export const index = 10;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/program/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/program/+page.ts";
export const imports = ["_app/immutable/nodes/10.CXZ2muiG.js","_app/immutable/chunks/BbpNz1p5.js","_app/immutable/chunks/BAOaa569.js","_app/immutable/chunks/2TU3FloQ.js","_app/immutable/chunks/D-3Bzmm_.js","_app/immutable/chunks/C_tEcc_T.js"];
export const stylesheets = ["_app/immutable/assets/Section.fGznzVEy.css","_app/immutable/assets/10.BgPgego8.css"];
export const fonts = [];
