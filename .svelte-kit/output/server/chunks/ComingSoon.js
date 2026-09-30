import "./dev.js";
import { t as Section } from "./Section.js";
//#region src/lib/components/ComingSoon.svelte
function ComingSoon($$renderer, $$props) {
	let { title } = $$props;
	Section($$renderer, {
		variant: "gray",
		title,
		children: ($$renderer) => {
			$$renderer.push(`<div class="mx-auto prose max-w-3xl text-center"><p>Information for IC2S2 2027 will be announced here as it becomes available.</p></div>`);
		},
		$$slots: { default: true }
	});
}
//#endregion
export { ComingSoon as t };
