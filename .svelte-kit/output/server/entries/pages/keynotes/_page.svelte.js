import "../../../chunks/dev.js";
import { t as ComingSoon } from "../../../chunks/ComingSoon.js";
//#region src/routes/keynotes/+page.svelte
function _page($$renderer) {
	ComingSoon($$renderer, { title: "Keynotes" });
}
//#endregion
export { _page as default };
