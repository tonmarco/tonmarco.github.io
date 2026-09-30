<script lang="ts">
	import { Star } from '@lucide/svelte';
	import EventMeta from './EventMeta.svelte';
	import { savedItems } from '$lib/stores/saved-items.svelte';
	import { dotColors } from './colors';
	import type { HydratedEvent, ParallelSession, ParallelPaper, Poster } from '$lib/data/types';

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
		event: HydratedEvent;
		session?: ParallelSession;
		paper?: ParallelPaper;
		poster?: Poster;
	}

	interface GroupData {
		category: string;
		type: string;
		dayLabel: string;
		eventTime: string;
		location?: string;
		items: Presentation[];
	}

	interface Props {
		group: GroupData;
		onSelectEvent: (event: HydratedEvent) => void;
		onSelectSession: (event: HydratedEvent, session: ParallelSession) => void;
		onSelectPaper: (event: HydratedEvent, session: ParallelSession, paper: ParallelPaper) => void;
		onSelectPoster: (event: HydratedEvent, poster: Poster) => void;
	}

	let { group, onSelectEvent, onSelectSession, onSelectPaper, onSelectPoster }: Props = $props();
</script>

<div class="mb-8">
	<span
		class="mb-2 inline-block rounded px-2 py-0.5 text-xs font-bold text-white"
		style="background-color: {dotColors[group.type] ?? '#999'};"
	>
		{group.type === 'parallel' ? 'Parallel Session' : group.type === 'lightning' ? 'Lightning Talks' : group.type === 'poster' ? 'Poster Session' : group.type}
	</span>
	<h2 class="mb-1 text-lg font-bold text-ic2s2-charcoal">{group.category}</h2>
	<EventMeta day={group.dayLabel} time={group.eventTime} location={group.location} />
	<ul class="space-y-0">
		{#each group.items as item (item.title + item.authors)}
			{@const itemKey = item.id
				? `${item.type}-${item.id}`
				: `${item.type}-${item.title}`}
			<li class="flex items-start gap-3 border-b border-gray-100 py-3 last:border-0">
				{#if item.time}
					<span class="w-14 shrink-0 pt-0.5 text-right text-xs font-bold text-gray-400"
						>{item.time}</span
					>
				{/if}
				<button
					class="flex-1 cursor-pointer text-left transition-colors hover:text-ic2s2-coral"
					onclick={() => {
						if (item.type === 'parallel' && item.session && item.paper) {
							onSelectPaper(item.event, item.session, item.paper);
						} else if (item.type === 'parallel' && item.session) {
							onSelectSession(item.event, item.session);
						} else if (item.type === 'poster' && item.poster) {
							onSelectPoster(item.event, item.poster);
						} else {
							onSelectEvent(item.event);
						}
					}}
				>
					<p class="text-sm font-medium underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral">{item.title}</p>
					<p class="mt-0.5 text-xs text-gray-500">{item.authors}</p>
				</button>
				<div class="flex shrink-0 items-center gap-2">
					{#if item.id}
						<span class="text-[0.6rem] text-gray-300">#{item.id}</span>
					{/if}
					<button
						class="cursor-pointer text-gray-300 hover:text-amber-500"
						onclick={() => savedItems.toggle(itemKey)}
						aria-label="Save"
					>
						<Star
							class="h-4 w-4"
							fill={savedItems.has(itemKey) ? 'currentColor' : 'none'}
						/>
					</button>
				</div>
			</li>
		{/each}
	</ul>
</div>
