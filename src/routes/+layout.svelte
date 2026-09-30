<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { siteConfig } from '$lib/data';

	let { children } = $props();

	const pageTitle = $derived(
		((page.data as Record<string, unknown>).title as string) ?? siteConfig.title
	);
	const isHomepage = $derived(
		((page.data as Record<string, unknown>).isHomepage as boolean) ?? false
	);
	const hideHeader = $derived(
		((page.data as Record<string, unknown>).hideHeader as boolean) ?? false
	);
	const hideFooter = $derived(
		((page.data as Record<string, unknown>).hideFooter as boolean) ?? false
	);
	const ogTitle = $derived(`${pageTitle} — ${siteConfig.tagline} | Milan, Italy 2027`);
</script>

<svelte:head>
	<title>{pageTitle} | {siteConfig.title}</title>
	<meta name="description" content={siteConfig.description} />

	<!-- OpenGraph -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content={ogTitle} />
	<meta property="og:description" content={siteConfig.ogDescription} />
	<meta property="og:url" content="{siteConfig.url}{page.url.pathname}" />
	<meta property="og:image" content="{siteConfig.url}/images/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content={siteConfig.locale} />
	<meta property="og:site_name" content={siteConfig.title} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={ogTitle} />
	<meta name="twitter:description" content={siteConfig.ogDescription} />
	<meta name="twitter:image" content="{siteConfig.url}/images/og-image.png" />
</svelte:head>

{#if !hideHeader}
	<Header {isHomepage} {pageTitle} />
{/if}

<main>
	{@render children()}
</main>

{#if !hideFooter}
	<Footer />
{/if}
