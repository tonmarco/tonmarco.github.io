import "../../../chunks/dev.js";
import { t as ComingSoon } from "../../../chunks/ComingSoon.js";
//#region src/routes/submit-tutorial/+page.svelte
function _page($$renderer) {
	ComingSoon($$renderer, { title: "Call for Tutorials" });
}
//#endregion
export { _page as default };
