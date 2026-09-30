<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { sponsors, siteConfig } from '$lib/data';
</script>

<Section variant="gray" title="Sponsor our Conference">
	<div class="prose mx-auto max-w-3xl">
		<h2>Sponsorship Levels</h2>
		<p>
			Please get in touch with us <a href="mailto:{siteConfig.emails.general}">here</a> to become a sponsor of this transdisciplinary event. We offer different ways to get involved:
		</p>

		{#each sponsors.levels as level}
			<h3>{level.title} &mdash; {level.price}</h3>
			<h4>Benefits:</h4>
			<ul>
				{#each level.benefits as benefit}
					<li>{benefit}</li>
				{/each}
			</ul>
		{/each}
	</div>
</Section>
