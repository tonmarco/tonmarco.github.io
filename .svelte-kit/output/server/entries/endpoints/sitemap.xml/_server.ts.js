import { t as siteConfig } from "../../../chunks/site-config.js";
//#region src/routes/sitemap.xml/+server.ts
var pages = [
	"/",
	"/about/",
	"/topics/",
	"/program/",
	"/organization/",
	"/venue/",
	"/conduct/"
];
var prerender = true;
function GET() {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${siteConfig.url}${page}</loc></url>`).join("\n")}
</urlset>`;
	return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
//#endregion
export { GET, prerender };
