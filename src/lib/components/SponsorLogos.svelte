<script lang="ts">
	import { sponsors } from '$lib/data';
</script>

{#each sponsors.sponsors as group}
	{#if group.sponsors.length > 0}
		<div class="mb-8">
			<h3 class="mb-4 text-center text-sm font-bold uppercase tracking-wider">
				{group.title}
			</h3>
			<div class="flex flex-wrap items-center justify-center gap-8">
				{#each group.sponsors as sponsor}
					<a
						href={sponsor.url}
						target="_blank"
						rel="noopener noreferrer"
						class="transition-opacity hover:opacity-80"
					>
						<img
							src={sponsor.image}
							alt={sponsor.name}
							class="h-16 max-w-48 object-contain"
						/>
					</a>
				{/each}
			</div>
		</div>
	{/if}
{/each}
