<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { scaleLinear } from 'd3-scale';
	import { zoom, zoomIdentity, type ZoomTransform } from 'd3-zoom';
	import { select } from 'd3-selection';
	import 'd3-transition';
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { projections } from '$lib/data/full-program/poster_projections';
	import type { PosterPoint, Projection } from '$lib/data/full-program/poster_projections';
	import { talkProjections } from '$lib/data/full-program/talk_projections';
	import { posters, parallelSessions } from '$lib/data/full-program';
	import type { Poster } from '$lib/data/types';
	import { themeColors, clusterPalette } from './colors';
	import EmbeddingControls from './EmbeddingControls.svelte';
	import EmbeddingDetailPanel from './EmbeddingDetailPanel.svelte';
	import * as Sheet from '$lib/components/ui/sheet';

	// ── Data mode ───────────────────────────────────────────────────────
	type DataMode = 'posters' | 'talks';
	let dataMode = $state<DataMode>('posters');

	// ── Build poster lookup map ─────────────────────────────────────────
	const posterMap = new SvelteMap<number, Poster>();
	for (const session of posters) {
		for (const p of session.posters) {
			posterMap.set(p.id, p);
		}
	}

	// ── Build talk lookup map ───────────────────────────────────────────
	interface TalkItem {
		id: number;
		title: string;
		authors: string;
		abstract?: string;
		theme: string;
		keywords?: string;
	}

	function stripSessionSuffix(title: string): string {
		return title.replace(/\s*\([^)]+\)\s*$/, '');
	}

	const talkMap = new SvelteMap<number, TalkItem>();
	for (const sess of parallelSessions) {
		for (const paper of sess.papers) {
			talkMap.set(paper.submission, {
				id: paper.submission,
				title: paper.title,
				authors: paper.authors,
				abstract: paper.abstract,
				theme: stripSessionSuffix(sess.title),
			});
		}
	}

	// ── Projection selector ─────────────────────────────────────────────
	let activeProjections = $derived<Projection[]>(dataMode === 'posters' ? projections : talkProjections);
	let activeIndex = $state(0);
	let activeProjection = $derived(activeProjections[activeIndex]);
	let activePoints = $derived(activeProjection?.points ?? []);

	// ── Color-by toggle ─────────────────────────────────────────────────
	type ColorMode = 'theme' | 'cluster';
	let colorMode = $state<ColorMode>('theme');
	let hasClusters = $derived(activeProjection?.hasClusters ?? false);
	let clusterLayers = $derived(activeProjection?.clusterLayers ?? null);
	let hasLayers = $derived(clusterLayers != null && clusterLayers.length > 1);
	let activeLayer = $state(0);
	let showClusterLabels = $state(true);

	// Label map for the current cluster resolution (flat clusters, or the active EVoC layer)
	let activeClusterLabels = $derived(
		hasLayers
			? (activeProjection?.clusterLayerLabels?.[activeLayer] ?? null)
			: (activeProjection?.clusterLabels ?? null)
	);

	function clusterForPoint(index: number): number | null {
		if (clusterLayers && hasLayers) {
			return clusterLayers[activeLayer]?.[index] ?? null;
		}
		return activePoints[index]?.cluster ?? null;
	}

	function colorForCluster(clusterId: number | null): string {
		if (clusterId == null) return '#999';
		if (clusterId === -1) return '#ccc';
		return clusterPalette[clusterId % clusterPalette.length];
	}

	function colorForPoint(pt: PosterPoint, index: number): string {
		if (colorMode === 'cluster') {
			return colorForCluster(clusterForPoint(index));
		}
		return themeColors[pt.theme] ?? '#999';
	}

	function colorFor(theme: string): string {
		return themeColors[theme] ?? '#999';
	}

	// ── Animated positions ──────────────────────────────────────────────
	// Interpolate each article's data-space (x, y) when the projection changes,
	// so points (and the selected dot) glide to their new location instead of jumping.
	// Keyed by a stable id order — the same id set exists in every projection.
	let orderedIds = $derived(activePoints.map((p) => p.id).sort((a, b) => a - b));

	let targetPositions = $derived.by((): { x: number; y: number }[] => {
		const byId = new Map(activePoints.map((p) => [p.id, p]));
		return orderedIds.map((id) => {
			const p = byId.get(id);
			return { x: p?.x ?? 0, y: p?.y ?? 0 };
		});
	});

	const tweenedPositions = new Tween<{ x: number; y: number }[]>([], {
		duration: 2100,
		easing: cubicOut
	});

	let lastMode: DataMode | null = null;
	$effect(() => {
		const target = targetPositions;
		// Snap (no animation) on first render and when switching posters↔talks (different
		// corpus). Otherwise animate the shared points to their new projection. Depend only
		// on target + dataMode — never read tweenedPositions.current here, or the effect
		// re-runs every animation frame and the tween wedges after a dataset round-trip.
		const instant = dataMode !== lastMode;
		lastMode = dataMode;
		tweenedPositions.set(target, instant ? { duration: 0 } : undefined);
	});

	let tweenedById = $derived.by(() => {
		const m = new Map<number, { x: number; y: number }>();
		const cur = tweenedPositions.current;
		orderedIds.forEach((id, i) => {
			if (cur[i]) m.set(id, cur[i]);
		});
		return m;
	});

	// ── Cluster centroids (for on-plot labels) ──────────────────────────
	interface Centroid { cluster: number; x: number; y: number; label: string }
	let centroids = $derived.by((): Centroid[] => {
		if (!hasClusters) return [];
		const acc = new Map<number, { sx: number; sy: number; n: number }>();
		activePoints.forEach((pt, i) => {
			const c = clusterForPoint(i);
			if (c == null || c === -1) return;
			const tp = tweenedById.get(pt.id) ?? pt;
			const a = acc.get(c) ?? { sx: 0, sy: 0, n: 0 };
			a.sx += tp.x;
			a.sy += tp.y;
			a.n += 1;
			acc.set(c, a);
		});
		const labels = activeClusterLabels;
		const out: Centroid[] = [];
		for (const [c, a] of acc) {
			const label = labels?.[String(c)]?.label;
			if (!label) continue; // skip unlabeled clusters (e.g. noise)
			out.push({ cluster: c, x: a.sx / a.n, y: a.sy / a.n, label });
		}
		return out;
	});

	// ── Layout ──────────────────────────────────────────────────────────
	const PADDING = 40;
	let innerHeight = $state(800);
	let plotHeight = $derived(Math.max(500, innerHeight - 300));
	let containerWidth = $state(800);
	let containerHeight = $state(600);
	let svgEl = $state<SVGSVGElement>(undefined!);

	// ── D3 scales: data [0,1] → pixel coords ───────────────────────────
	let xScale = $derived(
		scaleLinear().domain([0, 1]).range([PADDING, containerWidth - PADDING])
	);
	let yScale = $derived(
		scaleLinear().domain([0, 1]).range([PADDING, containerHeight - PADDING])
	);

	// ── D3 zoom ─────────────────────────────────────────────────────────
	let transform = $state<ZoomTransform>(zoomIdentity);

	const zoomBehavior = zoom<SVGSVGElement, unknown>()
		.scaleExtent([0.3, 15])
		.on('zoom', (event) => {
			transform = event.transform;
		});

	$effect(() => {
		if (!svgEl) return;
		select(svgEl).call(zoomBehavior);
		select(svgEl).on('dblclick.zoom', null);
	});

	function zoomIn() {
		select(svgEl).transition().duration(300).call(zoomBehavior.scaleBy, 1.4);
	}

	function zoomOut() {
		select(svgEl).transition().duration(300).call(zoomBehavior.scaleBy, 1 / 1.4);
	}

	function resetView() {
		select(svgEl).transition().duration(400).call(zoomBehavior.transform, zoomIdentity);
	}

	// ── Interaction state ───────────────────────────────────────────────
	let hoveredPoint: PosterPoint | null = $state(null);
	// Selection is keyed by article id so it persists across projection / layer / color changes.
	let selectedId: number | null = $state(null);
	type DetailItem = { id: number; title: string; authors: string; abstract?: string; theme: string; keywords?: string };
	let mobileSheetOpen = $state(false);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let showHelp = $state(false);

	function lookupItem(id: number): DetailItem | null {
		if (dataMode === 'posters') return posterMap.get(id) ?? null;
		return talkMap.get(id) ?? null;
	}

	// Everything about the selection is derived from selectedId + the active projection,
	// so switching projection re-resolves the same article to its new point/index/cluster.
	let selectedIndex = $derived(
		selectedId == null ? -1 : activePoints.findIndex((p) => p.id === selectedId)
	);
	let selectedPoint = $derived<PosterPoint | null>(
		selectedIndex < 0 ? null : activePoints[selectedIndex]
	);
	let selectedItem = $derived<DetailItem | null>(
		selectedId == null ? null : lookupItem(selectedId)
	);

	// Cluster label + description for the selected point, at the current resolution
	let selectedClusterLabel = $derived.by((): { label: string; description: string } | null => {
		if (selectedIndex < 0 || !hasClusters) return null;
		const c = clusterForPoint(selectedIndex);
		if (c == null || c === -1) return null;
		return activeClusterLabels?.[String(c)] ?? null;
	});

	let selectedClusterColor = $derived.by((): string | null => {
		if (selectedIndex < 0 || !hasClusters) return null;
		const c = clusterForPoint(selectedIndex);
		if (c == null || c === -1) return null;
		return colorForCluster(c);
	});

	// Cluster label + color for the hovered point (cluster mode only) — for the hover tooltip
	let hoveredCluster = $derived.by((): { label: string; color: string } | null => {
		const hp = hoveredPoint;
		if (!hp || colorMode !== 'cluster' || !hasClusters) return null;
		const i = activePoints.findIndex((p) => p.id === hp.id);
		if (i < 0) return null;
		const c = clusterForPoint(i);
		if (c == null || c === -1) return null;
		const label = activeClusterLabels?.[String(c)]?.label;
		if (!label) return null;
		return { label, color: colorForCluster(c) };
	});

	function selectPoint(pt: PosterPoint) {
		selectedId = pt.id;
	}

	function closeDetail() {
		selectedId = null;
		mobileSheetOpen = false;
	}

	function switchDataMode(mode: DataMode) {
		dataMode = mode;
		activeIndex = 0;
		colorMode = 'theme';
		activeLayer = 0;
		closeDetail();
		resetView();
	}

	function truncate(str: string, max: number): string {
		if (str.length <= max) return str;
		return str.slice(0, max).trimEnd() + '…';
	}

	function handlePointerMove(e: PointerEvent) {
		const rect = svgEl.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}

	function handleProjectionChange() {
		// Keep the current article selected across projection changes; just reframe the view.
		resetView();
	}
</script>

<svelte:window bind:innerHeight />

{#if activeProjections.length === 0}
	<div
		class="flex min-h-[500px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12"
	>
		<div class="text-center">
			<p class="mb-2 text-lg font-medium text-gray-600">No embedding data available.</p>
			<p class="font-mono text-sm text-gray-400">
				Run <code class="rounded bg-gray-200 px-2 py-0.5">uv run scripts/embed.py --dataset posters</code> to
				generate projections.
			</p>
		</div>
	</div>
{:else}
	<div class="flex gap-0">
		<!-- SVG scatter plot -->
		<div
			class="relative flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white md:rounded-r-none"
			style="min-height: {plotHeight}px;"
			bind:clientWidth={containerWidth}
			bind:clientHeight={containerHeight}
		>
			<svg
				bind:this={svgEl}
				width={containerWidth}
				height={containerHeight}
				role="img"
				aria-label="Poster embeddings scatter plot"
				class="block cursor-grab active:cursor-grabbing"
				onpointermove={handlePointerMove}
			>
				<g transform={transform.toString()}>
					{#each activePoints as pt, ptIdx (pt.id)}
						{@const tp = tweenedById.get(pt.id)}
						{@const cx = xScale(tp ? tp.x : pt.x)}
						{@const cy = yScale(tp ? tp.y : pt.y)}
						{@const isHovered = hoveredPoint?.id === pt.id}
						{@const isSelected = selectedPoint?.id === pt.id}
						{@const baseR = 5 / transform.k}

						{#if isSelected}
							<circle
								{cx}
								{cy}
								r={baseR + 4 / transform.k}
								fill="none"
								stroke={colorForPoint(pt, ptIdx)}
								stroke-width={2 / transform.k}
								opacity="0.4"
							/>
						{/if}

						<circle
							{cx}
							{cy}
							r={Math.max(baseR * 2.5, 16 / transform.k)}
							fill="transparent"
							role="button"
							tabindex="-1"
							aria-label={lookupItem(pt.id)?.title ?? `Item ${pt.id}`}
							onpointerenter={() => (hoveredPoint = pt)}
							onpointerleave={() => (hoveredPoint = null)}
							onclick={() => selectPoint(pt)}
							onkeydown={(e) => { if (e.key === 'Enter') selectPoint(pt); }}
							style="cursor: pointer;"
						/>
						<circle
							{cx}
							{cy}
							r={isHovered ? baseR * 1.4 : baseR}
							fill={colorForPoint(pt, ptIdx)}
							opacity={isSelected ? 1 : isHovered ? 0.95 : 0.75}
							stroke={isHovered || isSelected ? '#333' : 'none'}
							stroke-width={isHovered || isSelected ? 1.5 / transform.k : 0}
							pointer-events="none"
						/>
					{/each}

					{#if colorMode === 'cluster' && showClusterLabels}
						{#each centroids as c (c.cluster)}
							<text
								x={xScale(c.x)}
								y={yScale(c.y)}
								text-anchor="middle"
								dominant-baseline="middle"
								paint-order="stroke"
								stroke="#ffffff"
								stroke-width={3.5 / transform.k}
								stroke-linejoin="round"
								fill="#1f2937"
								font-size={13 / transform.k}
								font-weight="700"
								class="pointer-events-none select-none"
							>{c.label}</text>
						{/each}
					{/if}
				</g>
			</svg>

			<!-- Hover tooltip (desktop only) -->
			{#if hoveredPoint}
				{@const item = lookupItem(hoveredPoint.id)}
				{#if item}
					<div
						class="pointer-events-none absolute z-20 hidden max-w-xs rounded-lg border border-gray-200 bg-white p-3 shadow-lg md:block"
						style="left: {Math.min(mouseX + 12, containerWidth - 260)}px; top: {mouseY > containerHeight - 120 ? mouseY - 110 : mouseY + 12}px;"
					>
						<p class="mb-1 text-sm font-medium leading-tight text-ic2s2-charcoal">
							{truncate(item.title, 80)}
						</p>
						<p class="mb-2 text-xs text-gray-500">
							{truncate(item.authors, 60)}
						</p>
						{#if colorMode !== 'cluster'}
							<span
								class="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
								style="background-color: {colorFor(item.theme)};"
							>
								{item.theme}
							</span>
						{:else if hoveredCluster}
							<span
								class="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
								style="background-color: {hoveredCluster.color};"
							>
								{hoveredCluster.label}
							</span>
						{/if}
					</div>
				{/if}
			{/if}

			<!-- Mobile: selected poster card (bottom) -->
			{#if selectedItem}
				<div class="absolute inset-x-3 bottom-14 z-20 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:hidden">
					<button
						class="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded text-gray-400 hover:text-gray-600"
						onclick={closeDetail}
						aria-label="Close"
					>
						<span class="text-lg leading-none">&times;</span>
					</button>
					{#if colorMode !== 'cluster'}
						<span
							class="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
							style="background-color: {colorFor(selectedItem.theme)};"
						>
							{selectedItem.theme}
						</span>
					{:else if selectedClusterLabel}
						<span
							class="mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
							style="background-color: {selectedClusterColor ?? '#64748b'};"
						>
							{selectedClusterLabel.label}
						</span>
					{/if}
					<p class="pr-6 text-sm font-semibold leading-snug text-ic2s2-charcoal">
						{selectedItem.title}
					</p>
					<p class="mt-1 text-xs text-gray-500">{selectedItem.authors}</p>
					<button
						class="mt-2 cursor-pointer text-xs font-medium text-ic2s2-coral underline underline-offset-2"
						onclick={() => (mobileSheetOpen = true)}
					>
						View details &rsaquo;
					</button>
				</div>
			{/if}

			<EmbeddingControls
				bind:activeIndex
				bind:colorMode
				{hasClusters}
				{hasLayers}
				{clusterLayers}
				bind:activeLayer
				bind:showClusterLabels
				bind:showHelp
				{dataMode}
				{activeProjections}
				onDataModeChange={switchDataMode}
				onProjectionChange={handleProjectionChange}
				onZoomIn={zoomIn}
				onZoomOut={zoomOut}
				onResetZoom={resetView}
			/>
		</div>

		<EmbeddingDetailPanel
			{selectedItem}
			{selectedPoint}
			{colorMode}
			clusterLabel={selectedClusterLabel}
			clusterColor={selectedClusterColor}
			onClose={closeDetail}
		/>
	</div>

	<!-- Mobile: poster detail sheet -->
	<div class="md:hidden">
		<Sheet.Root bind:open={mobileSheetOpen} onOpenChange={(open) => { if (!open) mobileSheetOpen = false; }}>
			<Sheet.Content side="right" showCloseButton={false} class="w-full! max-w-none! overflow-y-auto bg-gray-50 text-foreground">
				<Sheet.Header class="sr-only">
					<Sheet.Title>Poster Details</Sheet.Title>
				</Sheet.Header>
				{#if selectedItem}
					<div class="px-6 pt-6 pb-6">
						<button
							class="mb-4 cursor-pointer text-sm text-gray-400 hover:text-gray-600"
							onclick={() => (mobileSheetOpen = false)}
						>
							&larr; Back to map
						</button>

						{#if colorMode !== 'cluster'}
							<span
								class="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
								style="background-color: {colorFor(selectedItem.theme)};"
							>
								{selectedItem.theme}
							</span>
						{:else if selectedClusterLabel}
							<div class="mb-3">
								<span
									class="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
									style="background-color: {selectedClusterColor ?? '#64748b'};"
								>
									{selectedClusterLabel.label}
								</span>
								<p class="mt-2 text-xs leading-relaxed text-gray-600">{selectedClusterLabel.description}</p>
							</div>
						{/if}

						<h2 class="mb-3 text-lg font-bold leading-snug text-ic2s2-charcoal">
							{selectedItem.title}
						</h2>

						<p class="mb-4 text-sm text-gray-600">{selectedItem.authors}</p>

						{#if selectedItem.keywords}
							<div class="mb-4">
								<h4 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Keywords</h4>
								<p class="text-sm text-gray-600">{selectedItem.keywords}</p>
							</div>
						{/if}

						{#if selectedItem.abstract}
							<div>
								<h4 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Abstract</h4>
								<p class="whitespace-pre-line text-sm leading-relaxed text-gray-700">{selectedItem.abstract}</p>
							</div>
						{/if}
					</div>
				{/if}
			</Sheet.Content>
		</Sheet.Root>
	</div>
{/if}
