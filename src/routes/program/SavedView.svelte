<script lang="ts">
	import { Star, CalendarPlus } from '@lucide/svelte';
	import { savedItems } from '$lib/stores/saved-items.svelte';
	import EventMeta from './EventMeta.svelte';
	import type { HydratedDay, HydratedEvent, ParallelSession, ParallelPaper, Poster, Tutorial } from '$lib/data/types';
	import { SvelteMap } from 'svelte/reactivity';
	import { buildIcs, localRange, type IcsEvent } from '$lib/ics';
	import { confDays } from '$lib/data/dates';
	import { dotColors as eventColors } from './colors';

	interface SavedEntry {
		key: string;
		type: 'tutorial' | 'session' | 'paper' | 'poster' | 'lightning';
		title: string;
		subtitle?: string;
		dayIndex: number;
		dayLabel: string;
		time: string;
		location?: string;
		track?: string;
		paperCount?: number;
		event: HydratedEvent;
		session?: ParallelSession;
		paper?: ParallelPaper;
		poster?: Poster;
		tutorial?: Tutorial;
	}

	let {
		program,
		onSelectEvent,
		onSelectSession,
		onSelectPaper,
		onSelectPoster,
		onSelectTutorial
	}: {
		program: HydratedDay[];
		onSelectEvent: (event: HydratedEvent) => void;
		onSelectSession: (event: HydratedEvent, session: ParallelSession) => void;
		onSelectPaper: (event: HydratedEvent, session: ParallelSession, paper: ParallelPaper) => void;
		onSelectPoster: (event: HydratedEvent, poster: Poster) => void;
		onSelectTutorial: (event: HydratedEvent, tutorial: Tutorial) => void;
	} = $props();

	const dayLabels = confDays.map((d) => d.label);

	// Saved-entry types mapped onto the shared event palette.
	const dotColors: Record<string, string> = {
		tutorial: eventColors.tutorial,
		session: eventColors.parallel,
		paper: eventColors.parallel,
		poster: eventColors.poster,
		lightning: eventColors.lightning
	};

	// Build lookup of all saveable items from the program
	const allSaveables = $derived.by(() => {
		const map = new SvelteMap<string, SavedEntry>();
		program.forEach((day, dayIdx) => {
			day.events.forEach((event) => {
				if (event.tutorials) {
					event.tutorials.forEach((tut) => {
						map.set(`tutorial-${tut.id}`, {
							key: `tutorial-${tut.id}`,
							type: 'tutorial',
							title: tut.title,
							subtitle: tut.tutors.map((t) => t.name).join(', '),
							dayIndex: dayIdx,
							dayLabel: dayLabels[dayIdx],
							time: tut.time,
							location: tut.room,
							event,
							tutorial: tut
						});
					});
				}
				if (event.parallelSessions) {
					event.parallelSessions.forEach((sess) => {
						map.set(`session-${sess.title}`, {
							key: `session-${sess.title}`,
							type: 'session',
							title: sess.title,
							subtitle: `Track ${sess.track}`,
							dayIndex: dayIdx,
							dayLabel: dayLabels[dayIdx],
							time: event.time,
							location: sess.room ?? event.location,
							track: `Track ${sess.track}`,
							paperCount: sess.papers.length,
							event,
							session: sess
						});
						sess.papers.forEach((paper) => {
							map.set(`parallel-${paper.submission}`, {
								key: `parallel-${paper.submission}`,
								type: 'paper',
								title: paper.title,
								subtitle: paper.authors,
								dayIndex: dayIdx,
								dayLabel: dayLabels[dayIdx],
								time: event.time,
								location: sess.room ?? event.location,
								track: `Track ${sess.track}`,
								event,
								session: sess,
								paper
							});
						});
					});
				}
				if (event.type === 'lightning' && event.items) {
					event.items.forEach((talk) => {
						map.set(`lightning-${talk.title}`, {
							key: `lightning-${talk.title}`,
							type: 'lightning',
							title: talk.title,
							subtitle: talk.presenters,
							dayIndex: dayIdx,
							dayLabel: dayLabels[dayIdx],
							time: talk.time ?? event.time,
							location: event.location,
							event
						});
					});
				}
				if (event.posterSession) {
					event.posterSession.posters.forEach((poster) => {
						map.set(`poster-${poster.id}`, {
							key: `poster-${poster.id}`,
							type: 'poster',
							title: poster.title,
							subtitle: poster.authors,
							dayIndex: dayIdx,
							dayLabel: dayLabels[dayIdx],
							time: event.time,
							location: event.location,
							event,
							poster
						});
					});
				}
			});
		});
		return map;
	});

	// Resolve saved keys to entries, grouped by day
	const savedEntries = $derived.by(() => {
		const entries: SavedEntry[] = [];
		for (const key of savedItems.all) {
			const entry = allSaveables.get(key);
			if (entry) entries.push(entry);
		}
		entries.sort((a, b) => a.dayIndex - b.dayIndex);
		return entries;
	});

	const groupedByDay = $derived.by(() => {
		const groups: { dayLabel: string; items: SavedEntry[]; posters: SavedEntry[] }[] = [];
		const map = new SvelteMap<string, { items: SavedEntry[]; posters: SavedEntry[] }>();
		for (const entry of savedEntries) {
			if (!map.has(entry.dayLabel)) {
				const bucket = { items: [] as SavedEntry[], posters: [] as SavedEntry[] };
				map.set(entry.dayLabel, bucket);
				groups.push({ dayLabel: entry.dayLabel, ...bucket });
			}
			const bucket = map.get(entry.dayLabel)!;
			if (entry.type === 'poster') {
				bucket.posters.push(entry);
			} else {
				bucket.items.push(entry);
			}
		}
		return groups;
	});

	// --- Calendar export (.ics) -------------------------------------------
	const typeLabels: Record<SavedEntry['type'], string> = {
		tutorial: 'Tutorial',
		session: 'Parallel Session',
		paper: 'Contributed Talk',
		poster: 'Poster',
		lightning: 'Lightning Talk'
	};

	function entryToIcs(entry: SavedEntry): IcsEvent | null {
		const date = confDays[entry.dayIndex]?.ymd;
		if (!date) return null;
		const range = localRange(date, entry.time);
		if (!range) return null;
		const desc = [typeLabels[entry.type], entry.subtitle, entry.track]
			.filter(Boolean)
			.join(' — ');
		return {
			uid: `${entry.key}@ic2s2-2026`,
			...range,
			summary: entry.title,
			location: entry.location,
			description: desc || undefined
		};
	}

	function exportCalendar() {
		const events = savedEntries
			.map(entryToIcs)
			.filter((e): e is IcsEvent => e !== null);
		if (!events.length) return;
		const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
		const ics = buildIcs(events, dtstamp);
		const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'ic2s2-2026-faves.ics';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	function glanceSummary(event: HydratedEvent): string {
		if (event.type === 'lightning' && event.items)
			return `Lightning Talks (${event.items.length})`;
		if (event.type === 'keynote' && event.speakers)
			return event.speakers.map((s) => s.name).join(' & ');
		if (event.type === 'parallel' && event.parallelSessions)
			return `Parallel Sessions (${event.parallelSessions.length})`;
		if (event.type === 'poster') return event.title;
		return event.title;
	}
</script>

{#snippet savedCard(entry: SavedEntry)}
	<div
		class="relative cursor-pointer rounded-md border border-l-4 border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
		style="border-left-color: {dotColors[entry.type] ?? '#ccc'};"
		role="button"
		tabindex="0"
		onclick={() => {
			if (entry.type === 'paper' && entry.session && entry.paper) {
				onSelectPaper(entry.event, entry.session, entry.paper);
			} else if (entry.type === 'session' && entry.session) {
				onSelectSession(entry.event, entry.session);
			} else if (entry.type === 'tutorial' && entry.tutorial) {
				onSelectTutorial(entry.event, entry.tutorial);
			} else if (entry.type === 'poster' && entry.poster) {
				onSelectPoster(entry.event, entry.poster);
			} else {
				onSelectEvent(entry.event);
			}
		}}
		onkeydown={(e) => { if (e.key === 'Enter') e.currentTarget.click(); }}
	>
		<span
			class="text-[0.55rem] font-bold uppercase tracking-wider"
			style="color: {dotColors[entry.type] ?? '#999'};"
		>
			{entry.type === 'session'
				? `${typeLabels.session} · ${entry.paperCount} talks`
				: typeLabels[entry.type]}
		</span>
		<p class="mt-1 text-sm font-semibold text-ic2s2-charcoal">{entry.title}</p>
		{#if entry.subtitle}
			<p class="mt-0.5 text-xs text-gray-500">{entry.subtitle}</p>
		{/if}
		<EventMeta
			day={entry.dayLabel}
			time={entry.time}
			location={entry.location}
			track={entry.track}
		/>
		<button
			class="absolute top-3 right-3 cursor-pointer text-amber-500 hover:text-amber-600"
			onclick={(e) => { e.stopPropagation(); savedItems.toggle(entry.key); }}
			aria-label="Remove from saved"
		>
			<Star class="h-4 w-4" fill="currentColor" />
		</button>
	</div>
{/snippet}

<div class="flex">
	<!-- Left: saved items -->
	<div class="min-w-0 flex-1 px-4 py-6 md:px-14">
		<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
			<h1 class="text-2xl font-bold text-ic2s2-coral">Your Saved Schedule</h1>
			<button
				class="inline-flex items-center gap-1.5 rounded-md border border-ic2s2-coral px-3 py-1.5 text-sm font-medium text-ic2s2-coral transition-colors hover:bg-ic2s2-coral hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ic2s2-coral"
				onclick={exportCalendar}
				disabled={savedEntries.length === 0}
			>
				<CalendarPlus class="size-4" aria-hidden="true" />
				Export to calendar
			</button>
		</div>

		{#if savedEntries.length === 0}
			<div class="py-12 text-center">
				<p class="text-sm text-gray-400">No items saved yet.</p>
				<p class="mt-1 text-xs text-gray-300">
					Star sessions, talks, or posters to build your personal schedule.
				</p>
			</div>
		{:else}
			{#each groupedByDay as group (group.dayLabel)}
				<div class="mb-8">
					<h2 class="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
						{group.dayLabel}
					</h2>
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each group.items as entry (entry.key)}
							{@render savedCard(entry)}
						{/each}
					</div>

					{#if group.posters.length > 0}
						<h3 class="mt-4 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
							Poster Session
						</h3>
						<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
							{#each group.posters as entry (entry.key)}
								{@render savedCard(entry)}
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	<!-- Right: Schedule at a Glance -->
	<aside class="hidden w-[32%] shrink-0 border-l border-gray-200 bg-gray-50 md:block">
		<div class="sticky top-0 px-5 pt-6 pb-6">
			<h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
				Schedule at a Glance
			</h3>

			{#each program as day (day.day)}
				<p class="mb-1 mt-3 text-xs font-semibold text-ic2s2-charcoal">{day.date}</p>
				<ul class="space-y-0">
					{#each day.events.filter((e) => e.type !== 'break' && e.type !== 'lunch' && e.type !== 'registration') as event (event.time + event.title)}
						<li>
							<button
								class="flex w-full cursor-pointer items-center py-0.5 text-left transition-colors hover:bg-gray-100"
								onclick={() => onSelectEvent(event)}
							>
								<span class="w-10 shrink-0 text-[0.65rem] text-gray-400"
									>{event.time.split('\u2013')[0]}</span
								>
								<span
									class="mx-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
									style="background-color: {eventColors[event.type] ?? '#ccc'};"
								></span>
								<span class="text-[0.7rem] text-gray-600">{glanceSummary(event)}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	</aside>
</div>
