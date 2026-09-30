<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import SponsorLogos from '$lib/components/SponsorLogos.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/data';
</script>

<Section variant="gray" title="Sponsor our Conference">
	<SponsorLogos />

	<Separator class="my-10" />

	<div class="text-center">
		<Button href="/sponsor-us/" size="lg" class="px-10 py-6 text-base">
			{siteConfig.sponsorButtonLabel}
		</Button>
	</div>
</Section>
