<script lang="ts">
	import { X } from '@lucide/svelte';
	import { themeColors } from './colors';
	import type { PosterPoint } from '$lib/data/full-program/poster_projections';

	interface DetailItem {
		id: number;
		title: string;
		authors: string;
		abstract?: string;
		theme: string;
		keywords?: string;
	}

	interface Props {
		selectedItem: DetailItem | null;
		selectedPoint: PosterPoint | null;
		colorMode: 'theme' | 'cluster';
		clusterLabel?: { label: string; description: string } | null;
		clusterColor?: string | null;
		onClose: () => void;
	}

	let {
		selectedItem,
		selectedPoint,
		colorMode,
		clusterLabel = null,
		clusterColor = null,
		onClose
	}: Props = $props();

	function colorFor(theme: string): string {
		return themeColors[theme] ?? '#999';
	}
</script>

<aside
	class="relative hidden w-[350px] shrink-0 overflow-y-auto rounded-r-lg border-y border-r border-gray-200 bg-gray-50 md:block"
>
	{#if selectedItem && selectedPoint}
		<div class="px-5 pt-5 pb-6">
			<button
				class="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
				onclick={onClose}
				aria-label="Close detail panel"
			>
				<X class="size-5" />
			</button>

			{#if colorMode !== 'cluster'}
				<span
					class="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
					style="background-color: {colorFor(selectedItem.theme)};"
				>
					{selectedItem.theme}
				</span>
			{:else if clusterLabel}
				<div class="mb-3">
					<span
						class="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
						style="background-color: {clusterColor ?? '#64748b'};"
					>
						{clusterLabel.label}
					</span>
					<p class="mt-2 text-xs leading-relaxed text-gray-600">{clusterLabel.description}</p>
				</div>
			{/if}

			<h3 class="mb-3 pr-6 text-base font-bold leading-snug text-ic2s2-charcoal">
				{selectedItem.title}
			</h3>

			<p class="mb-4 text-sm text-gray-600">
				{selectedItem.authors}
			</p>

			{#if selectedItem.keywords}
				<div class="mb-4">
					<h4 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
						Keywords
					</h4>
					<p class="text-sm text-gray-600">{selectedItem.keywords}</p>
				</div>
			{/if}

			{#if selectedItem.abstract}
				<div>
					<h4 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
						Abstract
					</h4>
					<p class="max-h-[300px] overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-gray-700">
						{selectedItem.abstract}
					</p>
				</div>
			{/if}
		</div>
	{:else}
		<div class="px-5 pt-5 pb-6">
			<h3 class="mb-3 text-base font-bold text-ic2s2-charcoal">About Similarity</h3>

			<p class="mb-3 text-sm leading-relaxed text-gray-600">
				Embeddings are a well-known approach to measure similarity between documents. They are often paired with a projection to visualize high-dimensional vectors in two dimensions, so that we can inspect which papers are "close" to each other.
			</p>

			<p class="mb-3 text-sm leading-relaxed text-gray-600">
				Here we make a little exercise: we provide many choices of embedding models and projections to communicate how subjective the notion of similarity is when comparing documents. As with the idea of centrality in network science, there is no single right way to say that two papers are similar.
			</p>

			<p class="mb-4 text-sm leading-relaxed text-gray-600">
				Use the dropdown above to switch between combinations and see how the landscape changes.
			</p>

			<div class="rounded-lg border border-blue-100 bg-blue-50 p-3">
				<h4 class="mb-1 text-sm font-semibold text-ic2s2-charcoal">Help us out!</h4>
				<p class="mb-2 text-sm leading-relaxed text-gray-600">
					Take our <a href="https://complexforms.uvm.edu/ic2s2/" class="font-medium text-blue-600 underline hover:text-blue-800">quick survey</a> to tell us which version you preferred and why. With enough responses, we'll learn which embedding space computational scientists find most useful — and what makes it work for them.
				</p>
				<p class="text-sm leading-relaxed text-gray-600">
					Have another embedding space in mind? Email your suggestion to <a href="mailto:jstonge1@uvm.edu" class="font-medium text-blue-600 underline hover:text-blue-800">jstonge1@uvm.edu</a>.
				</p>
			</div>

			<div class="mt-4 rounded-lg border border-gray-200 bg-white p-3">
				<p class="text-sm leading-relaxed text-gray-500">
					Click any dot to see the poster's title, authors, keywords, and abstract. For EVoC projections, a granularity slider lets you explore clusters at different levels of detail.
				</p>
			</div>
		</div>
	{/if}
</aside>
