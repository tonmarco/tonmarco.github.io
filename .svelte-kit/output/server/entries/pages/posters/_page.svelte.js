import "../../../chunks/dev.js";
import { t as ComingSoon } from "../../../chunks/ComingSoon.js";
//#region src/routes/posters/+page.svelte
function _page($$renderer) {
	ComingSoon($$renderer, { title: "Poster Presentations" });
}
//#endregion
export { _page as default };
