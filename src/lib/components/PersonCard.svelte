<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	interface Props {
		name: string;
		affiliation?: string;
		field?: string;
		image?: string;
		url?: string;
	}

	let { name, affiliation, field, image, url }: Props = $props();
</script>

<Card.Root class="overflow-hidden text-center">
	<img
		src={image || '/images/person.svg'}
		alt={name}
		class="h-48 w-full object-cover"
	/>
	<Card.Content class="flex flex-col items-center gap-2 pt-4">
		{#if url}
			<a href={url} target="_blank" rel="noopener noreferrer" class="font-semibold hover:text-ic2s2-coral">
				{name}
			</a>
		{:else}
			<span class="font-semibold">{name}</span>
		{/if}
		{#if affiliation}
			<p class="text-sm text-muted-foreground">{affiliation}</p>
		{/if}
		{#if field}
			<p class="text-xs text-muted-foreground/70">{field}</p>
		{/if}
	</Card.Content>
</Card.Root>
