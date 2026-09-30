import { Q as escape_html, Z as clsx, n as attr_class } from "./dev.js";
import { t as cn } from "./utils2.js";
//#region src/lib/components/Section.svelte
function Section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { variant = "white", title, class: className, children } = $$props;
		const variantClasses = {
			coral: "bg-ic2s2-coral text-white overlay",
			white: "bg-white text-ic2s2-charcoal",
			gray: "bg-ic2s2-gray text-ic2s2-charcoal overlay"
		};
		const titleBg = {
			coral: "bg-ic2s2-coral text-white overlay",
			white: "bg-white text-ic2s2-charcoal",
			gray: "bg-ic2s2-gray text-ic2s2-charcoal overlay"
		};
		$$renderer.push(`<section${attr_class(clsx(cn("relative py-16 md:py-20", variantClasses[variant], className)), "svelte-7a8mnf")}>`);
		if (title) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div${attr_class(clsx(cn("section-title absolute left-1/2 top-px -translate-x-1/2 -translate-y-full", "flex items-end justify-center pb-1", "h-[3.25em] w-[25em] max-w-[90vw]", "text-center text-[0.9em] font-bold uppercase tracking-[0.25em]", titleBg[variant])), "svelte-7a8mnf")}>${escape_html(title)}</div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="mx-auto max-w-5xl px-6 md:px-12">`);
		children($$renderer);
		$$renderer.push(`<!----></div></section>`);
	});
}
//#endregion
export { Section as t };
