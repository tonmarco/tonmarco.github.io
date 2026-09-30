import { Q as escape_html, X as attr, f as stringify, s as ensure_array_like } from "../../../chunks/dev.js";
import { t as siteConfig } from "../../../chunks/site-config.js";
import { t as sponsors } from "../../../chunks/sponsors.js";
import { t as Section } from "../../../chunks/Section.js";
//#region src/routes/sponsor-us/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Section($$renderer, {
			variant: "gray",
			title: "Sponsor our Conference",
			children: ($$renderer) => {
				$$renderer.push(`<div class="prose mx-auto max-w-3xl"><h2>Sponsorship Levels</h2> <p>Please get in touch with us <a${attr("href", `mailto:${stringify(siteConfig.emails.general)}`)}>here</a> to become a sponsor of this transdisciplinary event. We offer different ways to get involved:</p> <!--[-->`);
				const each_array = ensure_array_like(sponsors.levels);
				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let level = each_array[$$index_1];
					$$renderer.push(`<h3>${escape_html(level.title)} — ${escape_html(level.price)}</h3> <h4>Benefits:</h4> <ul><!--[-->`);
					const each_array_1 = ensure_array_like(level.benefits);
					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let benefit = each_array_1[$$index];
						$$renderer.push(`<li>${escape_html(benefit)}</li>`);
					}
					$$renderer.push(`<!--]--></ul>`);
				}
				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
export { _page as default };
