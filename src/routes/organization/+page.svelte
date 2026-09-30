<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import { people } from '$lib/data';

	const variants = ['coral', 'white', 'gray'] as const;
</script>

{#each people as group, i}
	{#if group.people.length > 0}
		<Section variant={variants[i % 3]} title={group.title}>
			<div class="flex flex-wrap justify-center gap-8">
				{#each group.people as person}
					<div class="w-[calc(50%-1rem)] text-center md:w-[calc(25%-1.5rem)]">
						{#if person.url}
							<a href={person.url} target="_blank" rel="noopener noreferrer">
								<img
									src={person.image || '/images/person.svg'}
									alt={person.name}
									class="mb-3 aspect-square w-full object-cover"
								/>
							</a>
						{:else}
							<img
								src={person.image || '/images/person.svg'}
								alt={person.name}
								class="mb-3 aspect-square w-full object-cover"
							/>
						{/if}
						<h3 class="text-base font-bold md:text-lg">
							{#if person.url}
								<a href={person.url} target="_blank" rel="noopener noreferrer" class="hover:underline">{person.name}</a>
							{:else}
								{person.name}
							{/if}
						</h3>
						<p class="text-sm">
							{person.affiliation}<br />
							{#if person.field}
								<span class="opacity-60">{person.field}</span>
							{/if}
						</p>
					</div>
				{/each}
			</div>
		</Section>
	{/if}
{/each}
