import { Q as escape_html, a as derived, s as ensure_array_like } from "../../chunks/dev.js";
import { t as Button } from "../../chunks/button.js";
import { n as SponsorLogos, t as Separator } from "../../chunks/separator.js";
import "../../chunks/utils2.js";
import { t as Section } from "../../chunks/Section.js";
import { tv } from "tailwind-variants";
//#region src/lib/data/dates.ts
var dates = [
	{
		text: "Abstract submission deadline: TBA",
		done: false,
		category: "conference"
	},
	{
		text: "Tutorial day: July 26, 2027",
		done: false,
		category: "tutorial"
	},
	{
		text: "Conference days: July 27-29, 2027",
		done: false,
		category: "conference"
	}
];
//#endregion
//#region src/lib/data/submission.ts
var submission = {
	call4abstracts_link: "https://easychair.org/cfp/IC2S2_2026",
	call4abstracts_open: false,
	call4tutorials_link: "https://docs.google.com/forms/d/e/1FAIpQLSccbpeg8oVCWdhImZEODX3BJfNJ8o_y-fMHOLLHIwXzK-fUeQ/viewform",
	call4tutorials_open: false
};
tv({
	base: "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors focus-visible:ring-[3px] [&>svg]:pointer-events-none",
	variants: { variant: {
		default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
		secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
		destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
		outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
		ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
		link: "text-primary underline-offset-4 hover:underline"
	} },
	defaultVariants: { variant: "default" }
});
//#endregion
//#region src/lib/components/ImportantDates.svelte
function ImportantDates($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { category, showHeading = true } = $$props;
		const filteredDates = derived(() => category ? dates.filter((d) => d.category === category) : dates);
		if (showHeading) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<h3 class="mb-4 text-center text-lg font-bold">Important Dates</h3>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <ul class="mx-auto max-w-2xl space-y-2 text-center"><!--[-->`);
		const each_array = ensure_array_like(filteredDates());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let date = each_array[$$index];
			$$renderer.push(`<li class="flex items-center justify-center gap-2">`);
			if (date.done) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<span class="text-sm line-through opacity-60">${escape_html(date.text)}</span>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<span class="text-sm font-medium">${escape_html(date.text)}</span>`);
			}
			$$renderer.push(`<!--]--></li>`);
		}
		$$renderer.push(`<!--]--></ul>`);
	});
}
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Section($$renderer, {
			variant: "gray",
			title: "About",
			children: ($$renderer) => {
				$$renderer.push(`<header class="mb-8 text-center"><h2 class="text-2xl font-bold md:text-3xl">13<sup>th</sup> International Conference on Computational Social Science</h2> <p class="mt-2 text-lg text-ic2s2-muted">Milan, Italy | July 26-29, 2027</p></header> <div class="mb-8"><img src="/images/venue/campus_2.jpg" alt="Bocconi University campus in Milan" class="w-full rounded-lg object-cover" style="aspect-ratio: 2.5;"/></div> `);
				Separator($$renderer, { class: "my-8" });
				$$renderer.push(`<!----> `);
				ImportantDates($$renderer, {});
				$$renderer.push(`<!----> `);
				if (submission.call4abstracts_open || submission.call4tutorials_open) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="mt-8 flex flex-wrap justify-center gap-4">`);
					if (submission.call4abstracts_open) {
						$$renderer.push("<!--[0-->");
						Button($$renderer, {
							href: "/submit-abstract/",
							size: "lg",
							children: ($$renderer) => {
								$$renderer.push(`<!---->Submit Abstract`);
							},
							$$slots: { default: true }
						});
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> `);
					if (submission.call4tutorials_open) {
						$$renderer.push("<!--[0-->");
						Button($$renderer, {
							href: "/submit-tutorial/",
							variant: "secondary",
							size: "lg",
							children: ($$renderer) => {
								$$renderer.push(`<!---->Submit Tutorial`);
							},
							$$slots: { default: true }
						});
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--> `);
				Separator($$renderer, { class: "my-8" });
				$$renderer.push(`<!----> <h3 class="mb-4 text-center text-lg font-bold">About the Conference: IC<sup>2</sup>S<sup>2</sup></h3> <div class="mx-auto prose max-w-none"><p>The International Conference for Computational Social Science (IC2S2) will be hosted by <a href="https://www.unibocconi.it/">Bocconi University</a> in Milan from July 26-29, 2027. IC2S2 has emerged as the dominant conference at the intersection
			of social and computational science, bringing together researchers from around the world in sociology,
			economics, political science, psychology, cognitive science, management, computer science, statistics
			and the full range of natural and applied sciences committed to understanding the social world through
			large-scale data and computation. IC2S2 is the annual conference of the <a href="https://iscss.org/">International Society for Computational Social Science.</a></p> <p>The full-scale three-day conference (July 27-29) will feature research and researchers from
			around the world, across a broad range of relevant fields, and working on all areas of
			computational social science to advance its many frontiers. July 26 will be reserved for
			workshops and tutorials particularly targeted at early-career scholars.</p> <p>The IC2S2 community actively balances and maintains a conversation between social and
			computational scientists which integrates technological advances and opportunities with social
			scientific rigor and insight.</p></div> `);
				Separator($$renderer, { class: "my-8" });
				$$renderer.push(`<!----> `);
				SponsorLogos($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}
//#endregion
export { _page as default };
