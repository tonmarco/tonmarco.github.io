import { Q as escape_html, X as attr, s as ensure_array_like } from "../../../chunks/dev.js";
import { t as Section } from "../../../chunks/Section.js";
//#region src/lib/data/people.ts
var people = [
	{
		title: "General Chairs",
		people: [
			{
				name: "Alessia Melegaro",
				affiliation: "Bocconi University",
				field: "Demography and Social Statistics",
				image: "/images/people/alessia_melegaro_1.jpeg",
				url: "https://www.unibocconi.it/en/faculty/alessia-melegaro"
			},
			{
				name: "Raya Muttarak",
				affiliation: "Bocconi University",
				field: "Demography",
				image: "/images/people/raya_muttarak_1_v2.jpg",
				url: "https://www.unibocconi.it/en/faculty/raya-muttarak"
			},
			{
				name: "Michele Tizzoni",
				affiliation: "University of Trento",
				field: "Computational Social Science",
				image: "/images/people/profile_MicheleTizzoni.png",
				url: "https://webapps.unitn.it/du/it/Persona/PER0253319/Curriculum"
			},
			{
				name: "Bruno Lepri",
				affiliation: "Fondazione Bruno Kessler",
				field: "Computational Social Science",
				image: "/images/people/bruno_lepri_1.jpg",
				url: "https://magazine.fbk.eu/en/spotlight/bruno-lepri/"
			}
		]
	},
	{
		title: "Local Chairs",
		people: [{
			name: "Duilio Balsamo",
			affiliation: "Bocconi University",
			field: "Computational Social Science",
			image: "/images/people/duilio_balsamo_1.jpg",
			url: "https://bidsa.unibocconi.eu/duilio-balsamo"
		}, {
			name: "Debora Nozza",
			affiliation: "Bocconi University",
			field: "Natural Language Processing",
			image: "/images/people/debora_nozza_2.jpg",
			url: "https://www.unibocconi.it/en/faculty/debora-nozza"
		}]
	},
	{
		title: "Program Chairs",
		people: [{
			name: "Lorenzo Lucchini",
			affiliation: "Fondazione Bruno Kessler",
			field: "Computational Epidemiology",
			image: "/images/people/Lorenzo_Lucchini_square2.png"
		}]
	},
	{
		title: "Tutorial Chairs",
		people: [
			{ name: "TBA" },
			{ name: "TBA" },
			{ name: "TBA" }
		]
	},
	{
		title: "Website & Social Media Chairs",
		people: [{
			name: "Ivana Crescenzi",
			affiliation: "Bocconi University",
			field: "Computer Science",
			image: "/images/people/ivana_crescenzi.jpg"
		}, {
			name: "Marco Tonin",
			affiliation: "University of Trento and Fondazione Bruno Kessler",
			field: "Computational Social Science",
			image: "/images/people/marco-tonin.png",
			url: "https://webapps.unitn.it/du/it/Persona/PER0191553/Curriculum"
		}]
	}
];
//#endregion
//#region src/routes/organization/+page.svelte
function _page($$renderer) {
	const variants = [
		"coral",
		"white",
		"gray"
	];
	$$renderer.push(`<!--[-->`);
	const each_array = ensure_array_like(people);
	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let group = each_array[i];
		if (group.people.length > 0) {
			$$renderer.push("<!--[0-->");
			Section($$renderer, {
				variant: variants[i % 3],
				title: group.title,
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-wrap justify-center gap-8"><!--[-->`);
					const each_array_1 = ensure_array_like(group.people);
					for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
						let person = each_array_1[$$index];
						$$renderer.push(`<div class="w-[calc(50%-1rem)] text-center md:w-[calc(25%-1.5rem)]">`);
						if (person.url) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<a${attr("href", person.url)} target="_blank" rel="noopener noreferrer"><img${attr("src", person.image || "/images/person.svg")}${attr("alt", person.name)} class="mb-3 aspect-square w-full object-cover"/></a>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`<img${attr("src", person.image || "/images/person.svg")}${attr("alt", person.name)} class="mb-3 aspect-square w-full object-cover"/>`);
						}
						$$renderer.push(`<!--]--> <h3 class="text-base font-bold md:text-lg">`);
						if (person.url) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<a${attr("href", person.url)} target="_blank" rel="noopener noreferrer" class="hover:underline">${escape_html(person.name)}</a>`);
						} else {
							$$renderer.push("<!--[-1-->");
							$$renderer.push(`${escape_html(person.name)}`);
						}
						$$renderer.push(`<!--]--></h3> <p class="text-sm">${escape_html(person.affiliation)}<br/> `);
						if (person.field) {
							$$renderer.push("<!--[0-->");
							$$renderer.push(`<span class="opacity-60">${escape_html(person.field)}</span>`);
						} else $$renderer.push("<!--[-1-->");
						$$renderer.push(`<!--]--></p></div>`);
					}
					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	}
	$$renderer.push(`<!--]-->`);
}
//#endregion
export { _page as default };
