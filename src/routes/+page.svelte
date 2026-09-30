<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import ImportantDates from '$lib/components/ImportantDates.svelte';
	import SponsorLogos from '$lib/components/SponsorLogos.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { submission } from '$lib/data';
</script>

<Section variant="gray" title="About">
	<header class="mb-8 text-center">
		<h2 class="text-2xl font-bold md:text-3xl">
			13<sup>th</sup> International Conference on Computational Social Science
		</h2>
		<p class="mt-2 text-lg text-ic2s2-muted">Milan, Italy | July 26-29, 2027</p>
	</header>

	<div class="mb-8">
		<img
			src="/images/venue/campus_2.jpg"
			alt="Bocconi University campus in Milan"
			class="w-full rounded-lg object-cover"
			style="aspect-ratio: 2.5;"
		/>
	</div>

	<Separator class="my-8" />

	<ImportantDates />

	{#if submission.call4abstracts_open || submission.call4tutorials_open}
		<div class="mt-8 flex flex-wrap justify-center gap-4">
			{#if submission.call4abstracts_open}
				<Button href="/submit-abstract/" size="lg">Submit Abstract</Button>
			{/if}
			{#if submission.call4tutorials_open}
				<Button href="/submit-tutorial/" variant="secondary" size="lg">Submit Tutorial</Button>
			{/if}
		</div>
	{/if}

	<Separator class="my-8" />

	<h3 class="mb-4 text-center text-lg font-bold">
		About the Conference: IC<sup>2</sup>S<sup>2</sup>
	</h3>

	<div class="mx-auto prose max-w-none">
		<p>
			The International Conference for Computational Social Science (IC2S2) will be hosted by
			<a href="https://www.unibocconi.it/">Bocconi University</a>
			in Milan from July 26-29, 2027. IC2S2 has emerged as the dominant conference at the intersection
			of social and computational science, bringing together researchers from around the world in sociology,
			economics, political science, psychology, cognitive science, management, computer science, statistics
			and the full range of natural and applied sciences committed to understanding the social world through
			large-scale data and computation. IC2S2 is the annual conference of the
			<a href="https://iscss.org/">International Society for Computational Social Science.</a>
		</p>

		<p>
			The full-scale three-day conference (July 27-29) will feature research and researchers from
			around the world, across a broad range of relevant fields, and working on all areas of
			computational social science to advance its many frontiers. July 26 will be reserved for
			workshops and tutorials particularly targeted at early-career scholars.
		</p>

		<p>
			The IC2S2 community actively balances and maintains a conversation between social and
			computational scientists which integrates technological advances and opportunities with social
			scientific rigor and insight.
		</p>
	</div>

	<Separator class="my-8" />

	<SponsorLogos />
</Section>
