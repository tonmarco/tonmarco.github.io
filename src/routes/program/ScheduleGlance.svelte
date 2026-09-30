<script lang="ts">
	import { dotColors } from './colors';
	import type { HydratedDay, HydratedEvent } from '$lib/data/types';

	interface Props {
		program: HydratedDay[];
		onSelectEvent: (event: HydratedEvent) => void;
	}

	let { program, onSelectEvent }: Props = $props();

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

<aside class="hidden w-[32%] shrink-0 border-l border-gray-200 bg-gray-50 md:block">
	<div class="sticky top-0 px-5 pt-6 pb-6">
		<h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
			Schedule at a Glance
		</h3>

		{#each program.slice(1) as day (day.day)}
			<p class="mb-1 mt-3 text-xs font-semibold text-ic2s2-charcoal">{day.date}</p>
			<ul class="space-y-0">
				{#each day.events.filter(e => e.type !== 'break' && e.type !== 'lunch' && e.type !== 'registration') as event (event.time + event.title)}
					<li>
						<button
							class="flex w-full cursor-pointer items-center py-0.5 text-left transition-colors hover:bg-gray-100"
							onclick={() => onSelectEvent(event)}
						>
							<span class="w-10 shrink-0 text-[0.65rem] text-gray-400"
								>{event.time.split('–')[0]}</span
							>
							<span
								class="mx-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
								style="background-color: {dotColors[event.type] ?? '#ccc'};"
							></span>
							<span class="text-[0.7rem] text-gray-600">{glanceSummary(event)}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/each}
	</div>
</aside>
