<script lang="ts">
	import { dates } from '$lib/data';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		category?: 'conference' | 'tutorial';
		showHeading?: boolean;
	}

	let { category, showHeading = true }: Props = $props();

	const filteredDates = $derived(
		category ? dates.filter((d) => d.category === category) : dates
	);
</script>

{#if showHeading}
	<h3 class="mb-4 text-center text-lg font-bold">Important Dates</h3>
{/if}

<ul class="mx-auto max-w-2xl space-y-2 text-center">
	{#each filteredDates as date}
		<li class="flex items-center justify-center gap-2">
			{#if date.done}
				<span class="text-sm line-through opacity-60">{date.text}</span>
			{:else}
				<span class="text-sm font-medium">{date.text}</span>
			{/if}
		</li>
	{/each}
</ul>
