import { Q as escape_html } from "../../../chunks/dev.js";
import { t as siteConfig } from "../../../chunks/site-config.js";
import { t as Button } from "../../../chunks/button.js";
import { n as SponsorLogos, t as Separator } from "../../../chunks/separator.js";
import { t as Section } from "../../../chunks/Section.js";
//#region src/routes/sponsors/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Section($$renderer, {
			variant: "gray",
			title: "Sponsor our Conference",
			children: ($$renderer) => {
				SponsorLogos($$renderer, {});
				$$renderer.push(`<!----> `);
				Separator($$renderer, { class: "my-10" });
				$$renderer.push(`<!----> <div class="text-center">`);
				Button($$renderer, {
					href: "/sponsor-us/",
					size: "lg",
					class: "px-10 py-6 text-base",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${escape_html(siteConfig.sponsorButtonLabel)}`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
export { _page as default };
