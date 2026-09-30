<script lang="ts">
	import { X, ZoomIn, ZoomOut, Maximize, Info } from '@lucide/svelte';
	import { Slider } from 'bits-ui';
	import type { Projection } from '$lib/data/full-program/poster_projections';

	type ColorMode = 'theme' | 'cluster';
	type DataMode = 'posters' | 'talks';

	// Shown in both the tooltip and the About panel — update the model/date stamp here only.
	const clusterLabelDisclaimer =
		"Cluster names and descriptions are AI-generated (Claude Opus 4.8 · 2026-07-02) from each paper's title and abstract — treat them as rough guides, not authoritative labels.";

	interface Props {
		activeIndex: number;
		colorMode: ColorMode;
		hasClusters: boolean;
		hasLayers: boolean;
		clusterLayers: number[][] | null;
		activeLayer: number;
		showClusterLabels: boolean;
		showHelp: boolean;
		dataMode: DataMode;
		activeProjections: Projection[];
		onDataModeChange: (mode: DataMode) => void;
		onProjectionChange: () => void;
		onZoomIn: () => void;
		onZoomOut: () => void;
		onResetZoom: () => void;
	}

	let {
		activeIndex = $bindable(),
		colorMode = $bindable(),
		hasClusters,
		hasLayers,
		clusterLayers,
		activeLayer = $bindable(),
		showClusterLabels = $bindable(),
		showHelp = $bindable(),
		dataMode,
		activeProjections,
		onDataModeChange,
		onProjectionChange,
		onZoomIn,
		onZoomOut,
		onResetZoom
	}: Props = $props();
</script>

<!-- Controls: projection selector + color toggle (top-left) -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="absolute left-3 top-3 z-20 flex flex-col items-start gap-2"
	onpointerdown={(e) => e.stopPropagation()}
	onwheel={(e) => e.stopPropagation()}
>
	<div class="flex overflow-hidden rounded border border-gray-300 bg-white shadow-md">
		<button
			class="cursor-pointer px-2 py-1 text-xs font-medium transition-colors {dataMode === 'posters' ? 'bg-ic2s2-coral text-white' : 'text-gray-500 hover:bg-gray-100'}"
			onclick={() => onDataModeChange('posters')}
		>Posters</button>
		<button
			class="cursor-pointer border-l border-gray-300 px-2 py-1 text-xs font-medium transition-colors {dataMode === 'talks' ? 'bg-ic2s2-coral text-white' : 'text-gray-500 hover:bg-gray-100'}"
			onclick={() => onDataModeChange('talks')}
		>Talks</button>
	</div>

	{#if activeProjections.length > 1}
		<select
			class="max-w-[45vw] cursor-pointer truncate rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-ic2s2-charcoal shadow-md focus:border-ic2s2-coral focus:outline-none"
			value={activeIndex}
			onchange={(e) => {
				const i = Number((e.currentTarget as HTMLSelectElement).value);
				activeIndex = i;
				// Keep the Theme/Cluster choice across projections; only fall back to Theme
				// when the new projection has no clusters to color by.
				if (!activeProjections[i]?.hasClusters) colorMode = 'theme';
				activeLayer = 0;
				onProjectionChange();
			}}
		>
			{#each activeProjections as proj, i (proj.label)}
				<option value={i}>{proj.label}</option>
			{/each}
		</select>
	{/if}

	{#if hasClusters}
		<div class="flex overflow-hidden rounded border border-gray-300 bg-white shadow-md">
			<button
				class="cursor-pointer px-2 py-1 text-xs font-medium transition-colors {colorMode === 'theme' ? 'bg-ic2s2-charcoal text-white' : 'text-gray-500 hover:bg-gray-100'}"
				onclick={() => (colorMode = 'theme')}
			>Theme</button>
			<button
				class="cursor-pointer border-l border-gray-300 px-2 py-1 text-xs font-medium transition-colors {colorMode === 'cluster' ? 'bg-ic2s2-charcoal text-white' : 'text-gray-500 hover:bg-gray-100'}"
				onclick={() => (colorMode = 'cluster')}
			>Cluster</button>
		</div>
	{/if}

	{#if hasClusters && colorMode === 'cluster'}
		<div
			class="hidden items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-ic2s2-charcoal shadow-md md:flex"
		>
			<label class="flex cursor-pointer items-center gap-1.5">
				<input
					type="checkbox"
					bind:checked={showClusterLabels}
					class="size-3 cursor-pointer accent-ic2s2-charcoal"
				/>
				Cluster labels
			</label>
			<span class="group relative inline-flex items-center">
				<button
					type="button"
					class="flex cursor-help items-center text-gray-400 transition-colors hover:text-gray-600"
					aria-label="About cluster labels"
				>
					<Info class="size-3.5" />
				</button>
				<span
					role="tooltip"
					class="pointer-events-none absolute left-0 top-full z-30 mt-1.5 hidden w-56 rounded-md border border-gray-200 bg-white p-2 text-[11px] leading-relaxed font-normal text-gray-600 shadow-lg group-hover:block group-focus-within:block"
				>
					{clusterLabelDisclaimer}
				</span>
			</span>
		</div>
	{/if}
</div>

<!-- Cluster layer slider (bottom-left) -->
{#if hasLayers && colorMode === 'cluster'}
	<div
		class="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 shadow-md"
	>
		<span class="text-xs text-gray-500">Fine</span>
		<Slider.Root
			type="single"
			min={0}
			max={clusterLayers!.length - 1}
			step={1}
			bind:value={activeLayer}
			class="relative flex w-28 touch-none items-center select-none"
		>
			{#snippet children({ thumbItems, tickItems })}
				<span class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-gray-200">
					<Slider.Range class="absolute h-full bg-ic2s2-charcoal" />
				</span>
				{#each thumbItems as thumb (thumb.index)}
					<Slider.Thumb
						index={thumb.index}
						class="z-5 block size-[20px] cursor-pointer rounded-full border-2 border-ic2s2-charcoal bg-white shadow-sm transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-ic2s2-coral focus-visible:outline-hidden"
					/>
				{/each}
				{#each tickItems as { index } (index)}
					<Slider.Tick
						{index}
						class="z-1 h-2 w-px bg-white"
					/>
				{/each}
			{/snippet}
		</Slider.Root>
		<span class="text-xs text-gray-500">Coarse</span>
	</div>
{/if}

<!-- Help button (mobile only, top-right) -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="absolute right-3 top-3 z-20 md:hidden"
	onpointerdown={(e) => e.stopPropagation()}
>
	<button
		onclick={() => (showHelp = !showHelp)}
		class="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white shadow-md transition-colors hover:bg-gray-100"
		aria-label="About this view"
	>
		<Info class="size-4 text-gray-600" />
	</button>
</div>

<!-- Help overlay (mobile) -->
{#if showHelp}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="absolute inset-x-3 top-14 z-30 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-lg md:hidden"
		onpointerdown={(e) => e.stopPropagation()}
	>
		<button
			class="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded text-gray-400 hover:text-gray-600"
			onclick={() => (showHelp = false)}
			aria-label="Close help"
		>
			<X class="size-4" />
		</button>

		<h4 class="mb-2 text-sm font-semibold text-ic2s2-charcoal">About Similarity</h4>
		<p class="mb-2 text-sm leading-relaxed text-gray-500">
			We provide many choices of embedding models and projections to show how subjective the notion of similarity is when comparing documents. As with centrality in network science, there is no single right way to say that two papers are similar.
		</p>
		<p class="mb-2 text-sm leading-relaxed text-gray-500">
			Tap any dot to see the poster details. For EVoC projections, a granularity slider lets you explore clusters at different levels.
		</p>
		<p class="mb-3 text-sm leading-relaxed text-gray-500">
			{clusterLabelDisclaimer}
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
	</div>
{/if}

<!-- Zoom controls (bottom-right) -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="absolute bottom-3 right-3 z-20 flex gap-1"
	onpointerdown={(e) => e.stopPropagation()}
>
	<button
		onclick={onZoomIn}
		class="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white shadow-md transition-colors hover:bg-gray-100"
		aria-label="Zoom in"
	>
		<ZoomIn class="size-4 text-gray-600" />
	</button>
	<button
		onclick={onZoomOut}
		class="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white shadow-md transition-colors hover:bg-gray-100"
		aria-label="Zoom out"
	>
		<ZoomOut class="size-4 text-gray-600" />
	</button>
	<button
		onclick={onResetZoom}
		class="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white shadow-md transition-colors hover:bg-gray-100"
		aria-label="Reset view"
	>
		<Maximize class="size-4 text-gray-600" />
	</button>
</div>
