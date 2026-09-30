<script lang="ts">
	import { List, ChartScatter } from '@lucide/svelte';
	import PresentationFilters from './PresentationFilters.svelte';
	import PresentationGroup from './PresentationGroup.svelte';
	import ScheduleGlance from './ScheduleGlance.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { confDays } from '$lib/data/dates';
	import type {
		HydratedDay,
		HydratedEvent,
		ParallelSession,
		ParallelPaper,
		Poster
	} from '$lib/data/types';

	interface Props {
		program: HydratedDay[];
		hideGlance?: boolean;
		onSelectEvent: (event: HydratedEvent) => void;
		onSelectSession: (event: HydratedEvent, session: ParallelSession) => void;
		onSelectPaper: (event: HydratedEvent, session: ParallelSession, paper: ParallelPaper) => void;
		onSelectPoster: (event: HydratedEvent, poster: Poster) => void;
	}

	let { program, hideGlance = false, onSelectEvent, onSelectSession, onSelectPaper, onSelectPoster }: Props = $props();

	type ViewMode = 'list' | 'embeddings';
	let viewMode = $state<ViewMode>('list');

	type FilterType = 'all' | 'parallel' | 'lightning' | 'posters';
	let filterType = $state<FilterType>('all');
	let filterDay = $state<number | null>(null);
	let searchQuery = $state('');

	interface Presentation {
		type: 'parallel' | 'lightning' | 'poster';
		id?: number;
		title: string;
		authors: string;
		time?: string;
		category: string;
		dayIndex: number;
		dayLabel: string;
		eventTime: string;
		location?: string;
		/** Precomputed lowercase search haystack (title + authors + category + id). */
		haystack?: string;
		event: HydratedEvent;
		session?: ParallelSession;
		paper?: ParallelPaper;
		poster?: Poster;
	}

	const dayLabels = confDays.map((d) => d.label);

	const allPresentations = $derived.by(() => {
		const items: Presentation[] = [];
		program.forEach((day, dayIdx) => {
			day.events.forEach((event) => {
				if (event.type === 'lightning' && event.items) {
					event.items.forEach((item) => {
						items.push({
							type: 'lightning',
							title: item.title,
							authors: item.presenters ?? '',
							time: item.time,
							category: event.title,
							dayIndex: dayIdx,
							dayLabel: dayLabels[dayIdx],
							eventTime: event.time,
							location: event.location,
							event
						});
					});
				}
				if (event.parallelSessions) {
					event.parallelSessions.forEach((sess) => {
						sess.papers.forEach((paper) => {
							items.push({
								type: 'parallel',
								id: paper.submission,
								title: paper.title,
								authors: paper.authors,
								category: sess.title,
								dayIndex: dayIdx,
								dayLabel: dayLabels[dayIdx],
								eventTime: event.time,
								location: sess.room ?? event.location,
								event,
								session: sess,
								paper
							});
						});
					});
				}
				if (event.posterSession) {
					event.posterSession.posters.forEach((poster) => {
						items.push({
							type: 'poster',
							id: poster.id,
							title: poster.title,
							authors: poster.authors,
							category: event.posterSession!.session,
							dayIndex: dayIdx,
							dayLabel: dayLabels[dayIdx],
							eventTime: event.time,
							location: event.location,
							event,
							poster
						});
					});
				}
			});
		});
		for (const p of items) {
			p.haystack = `${p.title} ${p.authors} ${p.category} ${p.id ?? ''}`.toLowerCase();
		}
		return items;
	});

	const filtered = $derived.by(() => {
		let items = allPresentations;
		if (filterType !== 'all') {
			items = items.filter((p) => p.type === (filterType === 'posters' ? 'poster' : filterType));
		}
		if (filterDay !== null) {
			items = items.filter((p) => p.dayIndex === filterDay);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			items = items.filter((p) => p.haystack!.includes(q));
		}
		return items;
	});

	const grouped = $derived.by(() => {
		const groups: {
			category: string;
			type: string;
			dayLabel: string;
			eventTime: string;
			location?: string;
			items: Presentation[];
		}[] = [];
		const map = new SvelteMap<string, (typeof groups)[0]>();
		for (const p of filtered) {
			const key = `${p.dayIndex}-${p.category}`;
			if (!map.has(key)) {
				const group = {
					category: p.category,
					type: p.type as string,
					dayLabel: p.dayLabel,
					eventTime: p.eventTime,
					location: p.location,
					items: [] as Presentation[]
				};
				map.set(key, group);
				groups.push(group);
			}
			map.get(key)!.items.push(p);
		}
		return groups;
	});
</script>

<div class="flex">
	<!-- Left: main content -->
	<div class="min-w-0 flex-1 px-4 py-6 md:px-14">
		<div class="mb-3 flex items-center justify-between gap-2 border-b border-gray-200 pb-3">
			<h1 class="text-lg font-bold text-ic2s2-black md:text-2xl">Contributed Talks & Posters</h1>
			<div class="flex shrink-0 overflow-hidden rounded-lg border border-gray-300">
				<button
					class="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors {viewMode === 'list' ? 'bg-ic2s2-charcoal text-white' : 'text-gray-500 hover:bg-gray-100'}"
					onclick={() => (viewMode = 'list')}
					aria-label="List view"
				>
					<List class="size-3.5" />
					<span class="hidden sm:inline">List</span>
				</button>
				<button
					class="flex cursor-pointer items-center gap-1.5 border-l border-gray-300 px-3 py-1.5 text-xs font-medium transition-colors {viewMode === 'embeddings' ? 'bg-ic2s2-charcoal text-white' : 'text-gray-500 hover:bg-gray-100'}"
					onclick={() => (viewMode = 'embeddings')}
					aria-label="Embeddings view"
				>
					<ChartScatter class="size-3.5" />
					<span class="hidden sm:inline">Embeddings</span>
				</button>
			</div>
		</div>

		{#if viewMode === 'embeddings'}
			<p class="mb-4 text-xs text-gray-400">Posters projected into 2D via UMAP. Zoom, pan, and click any dot for details.</p>
			<!-- Lazy-loaded: keeps the projection data + d3 out of the default program bundle -->
			{#await import('./EmbeddingView.svelte')}
				<p class="py-12 text-center text-sm text-gray-400">Loading embeddings…</p>
			{:then { default: EmbeddingView }}
				<EmbeddingView />
			{/await}
		{:else}
			<PresentationFilters
				bind:filterType
				bind:filterDay
				bind:searchQuery
				resultCount={filtered.length}
			/>

			{#each grouped as group (group.category + group.dayLabel)}
				<PresentationGroup
					{group}
					{onSelectEvent}
					{onSelectSession}
					{onSelectPaper}
					{onSelectPoster}
				/>
			{/each}

			{#if filtered.length === 0}
				<p class="py-12 text-center text-sm text-gray-400">
					No presentations match your filters.
				</p>
			{/if}
		{/if}
	</div>

	{#if !hideGlance && viewMode !== 'embeddings'}
		<ScheduleGlance {program} {onSelectEvent} />
	{/if}
</div>
