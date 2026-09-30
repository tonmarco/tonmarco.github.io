import "../../../chunks/dev.js";
import { t as ComingSoon } from "../../../chunks/ComingSoon.js";
//#region src/routes/tutorials/+page.svelte
function _page($$renderer) {
	ComingSoon($$renderer, { title: "Tutorials" });
}
//#endregion
export { _page as default };
