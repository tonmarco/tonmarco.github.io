//#region src/lib/data/sponsors.ts
var sponsors = {
	levels: [
		{
			title: "Platinum Sponsors",
			price: "$10,000 and above",
			benefits: [
				"Logo and link on the conference webpage",
				"Logo displayed prominently at the venue and on all conference materials",
				"Complimentary registration and social event tickets for five representatives"
			]
		},
		{
			title: "Gold Sponsors",
			price: "$6,000",
			benefits: [
				"Logo and link on the conference webpage",
				"Logo displayed prominently at the venue and on all conference materials",
				"Complimentary registration and social event tickets for three representatives"
			]
		},
		{
			title: "Silver Sponsors",
			price: "$4,000",
			benefits: ["Logo and link on the conference webpage", "Logo displayed on conference materials"]
		},
		{
			title: "Bronze Sponsors",
			price: "$2,000",
			benefits: ["Logo and link on the conference webpage", "Acknowledgment in the program booklet and during conference sessions"]
		}
	],
	sponsors: [{
		title: "Academic Sponsors",
		sponsors: [{
			name: "Bocconi University",
			image: "/images/sponsors/Bocconi_University_Logo.webp",
			width: 2,
			url: "https://www.unibocconi.it/en/"
		}]
	}]
};
//#endregion
export { sponsors as t };
