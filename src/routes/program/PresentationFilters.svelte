<script lang="ts">
	import { Search } from '@lucide/svelte';

	type FilterType = 'all' | 'parallel' | 'lightning' | 'posters';

	interface Props {
		filterType: FilterType;
		filterDay: number | null;
		searchQuery: string;
		resultCount: number;
	}

	let { filterType = $bindable(), filterDay = $bindable(), searchQuery = $bindable(), resultCount }: Props = $props();

	const dayFilters = [
		{ short: 'Wed', index: 1 },
		{ short: 'Thu', index: 2 },
		{ short: 'Fri', index: 3 }
	];
</script>

<div class="mb-4 mt-2 flex flex-wrap items-center gap-2">
	{#each [['all', 'All Types'], ['parallel', 'Parallel'], ['lightning', 'Lightning'], ['posters', 'Posters']] as [value, label] (value)}
		<button
			class="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors {filterType ===
			value
				? 'border-ic2s2-charcoal bg-ic2s2-charcoal text-white'
				: 'border-gray-300 text-gray-500 hover:bg-gray-100'}"
			onclick={() => (filterType = value as FilterType)}
		>{label}</button>
	{/each}
	<span class="mx-2 h-4 w-px bg-gray-300"></span>
	<button
		class="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors {filterDay ===
		null
			? 'border-ic2s2-charcoal bg-ic2s2-charcoal text-white'
			: 'border-gray-300 text-gray-500 hover:bg-gray-100'}"
		onclick={() => (filterDay = null)}
	>All Days</button>
	{#each dayFilters as df (df.short)}
		<button
			class="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors {filterDay ===
			df.index
				? 'border-ic2s2-charcoal bg-ic2s2-charcoal text-white'
				: 'border-gray-300 text-gray-500 hover:bg-gray-100'}"
			onclick={() => (filterDay = df.index)}
		>{df.short}</button>
	{/each}
	<span class="ml-auto text-xs text-gray-400">{resultCount} presentations</span>
</div>

<div class="relative mt-6 mb-6">
	<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
	<input
		type="text"
		placeholder="Search by title, author, ID, or keyword..."
		bind:value={searchQuery}
		class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-ic2s2-charcoal placeholder:text-gray-400 focus:border-ic2s2-coral focus:outline-none"
	/>
</div>
