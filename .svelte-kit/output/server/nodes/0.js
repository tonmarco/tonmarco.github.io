import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BK-AUZc0.js","_app/immutable/chunks/BbpNz1p5.js","_app/immutable/chunks/BAOaa569.js","_app/immutable/chunks/2TU3FloQ.js","_app/immutable/chunks/CAx5L-3A.js","_app/immutable/chunks/CBpS4qen.js","_app/immutable/chunks/CB27dUru.js","_app/immutable/chunks/C_tEcc_T.js","_app/immutable/chunks/C1Mwb1PJ.js"];
export const stylesheets = ["_app/immutable/assets/0.B5HjByO9.css"];
export const fonts = [];
