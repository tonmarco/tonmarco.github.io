<script lang="ts">
	import type { EventType, HydratedEvent, HydratedDay, ParallelSession, Tutorial } from '$lib/data/types';
	let {
		program,
		activeDay,
		onSelectEvent,
		onSelectSession,
		onSelectTutorial
	}: {
		program: HydratedDay[];
		activeDay: number | null;
		onSelectEvent: (event: HydratedEvent) => void;
		onSelectSession: (event: HydratedEvent, session: ParallelSession) => void;
		onSelectTutorial: (event: HydratedEvent, tutorial: Tutorial) => void;
	} = $props();

	const typeClasses: Record<EventType, string> = {
		registration: 'ev-registration',
		remarks: 'ev-remarks',
		lightning: 'ev-lightning',
		keynote: 'ev-keynote',
		parallel: 'ev-parallel',
		poster: 'ev-poster',
		break: 'ev-break',
		lunch: 'ev-lunch',
		tutorial: 'ev-tutorial',
		social: 'ev-social'
	};

	function evClass(type: EventType): string {
		return typeClasses[type];
	}

	function displayLocation(location?: string): string {
		// The whole conference is in the Davis Center, so strip the venue name
		// and show what remains (floor, lounge, or room).
		if (!location) return '';
		const m = location.match(/^Davis Center(?:[,\s]+(.*))?$/i);
		return (m ? (m[1] ?? '') : location).trim();
	}

	function parseTime(t: string): number {
		const [h, m] = t.split(':').map(Number);
		return h * 60 + (m || 0);
	}

	function startMinutes(time: string): number {
		return parseTime(time.split('\u2013')[0]);
	}

	function endMinutes(time: string): number {
		const parts = time.split('\u2013');
		return parts.length > 1 ? parseTime(parts[1]) : parseTime(parts[0]) + 45;
	}

	const CAL_START = 7.5 * 60;
	const CAL_END = 19 * 60;
	const TOTAL_MINUTES = CAL_END - CAL_START;

	const timeLabels = [
		'7:30',
		'8:00',
		'8:30',
		'9:00',
		'9:30',
		'10:00',
		'10:30',
		'11:00',
		'11:30',
		'12:00',
		'12:30',
		'13:00',
		'13:30',
		'14:00',
		'14:30',
		'15:00',
		'15:30',
		'16:00',
		'16:30',
		'17:00',
		'17:30',
		'18:00'
	];

	function eventPosition(time: string) {
		const start = Math.max(startMinutes(time), CAL_START);
		const end = Math.min(endMinutes(time), CAL_END);
		const top = ((start - CAL_START) / TOTAL_MINUTES) * 100;
		const height = ((end - start) / TOTAL_MINUTES) * 100;
		return { top: `${top}%`, height: `${Math.max(height, 1.5)}%` };
	}

	function shortLabel(event: HydratedEvent): string {
		const { title, type } = event;
		if (type === 'break' || type === 'lunch' || type === 'registration') return title;
		if (type === 'social') return title;
		if (type === 'keynote') {
			return event.speakers && event.speakers.length > 1 ? 'Joint Keynote' : 'Keynote';
		}
		if (type === 'lightning') return 'Lightning Talks';
		if (type === 'parallel') return 'Parallel Sessions';
		if (type === 'tutorial') return 'Tutorials';
		if (type === 'remarks') return title;
		return title;
	}

	function scrollFade(node: HTMLElement) {
		function update() {
			const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 4;
			const canScroll = node.scrollHeight > node.clientHeight;
			if (canScroll && !atBottom) {
				node.style.maskImage = 'linear-gradient(to bottom, black 70%, transparent 100%)';
				node.style.webkitMaskImage = 'linear-gradient(to bottom, black 70%, transparent 100%)';
			} else {
				node.style.maskImage = 'none';
				node.style.webkitMaskImage = 'none';
			}
		}
		update();
		node.addEventListener('scroll', update);
		const ro = new ResizeObserver(update);
		ro.observe(node);
		return {
			destroy() {
				node.removeEventListener('scroll', update);
				ro.disconnect();
			}
		};
	}

	function hasCalendarItems(event: HydratedEvent): boolean {
		if (event.type === 'tutorial' && event.tutorials && event.tutorials.length > 0) return true;
		if (event.type === 'parallel' && event.parallelSessions && event.parallelSessions.length > 0)
			return true;
		return false;
	}

	function hasDetailContent(event: HydratedEvent): boolean {
		if (hasCalendarItems(event)) return true;
		if (event.type === 'lightning' && event.items && event.items.length > 0) return true;
		if (event.type === 'keynote' && event.speakers && event.speakers.length > 0) return true;
		if (event.type === 'remarks' && event.items && event.items.length > 0) return true;
		return false;
	}
</script>

<div class="px-6 py-6">
	<!-- Desktop calendar -->
	<div class="hidden md:block">
		<div
			class="grid"
			style="grid-template-columns: 60px repeat({activeDay !== null ? 1 : 4}, 1fr);"
		>
			<!-- Sticky column headers -->
			<div class="sticky top-0 z-10 bg-white"></div>
			{#each program as day, i (day.day)}
				{#if activeDay === null || activeDay === i}
					<div
						class="sticky top-0 z-10 border-b-2 border-ic2s2-coral bg-white px-2 py-2 text-center text-sm font-bold text-ic2s2-charcoal"
					>
						{day.day}<br />
						<span class="text-xs font-normal text-gray-500">{day.date}</span>
					</div>
				{/if}
			{/each}

			<!-- Time axis -->
			<div class="relative" style="height: {TOTAL_MINUTES * 2}px;">
				{#each timeLabels as label (label)}
					{@const pos = ((parseTime(label) - CAL_START) / TOTAL_MINUTES) * 100}
					<span class="absolute right-1 text-xs text-gray-400" style="top: {pos}%;"
						>{label}</span
					>
				{/each}
			</div>

			<!-- Day columns -->
			{#each program as day, i (day.day)}
				{#if activeDay === null || activeDay === i}
					<div
						class="calendar-bg relative border-l border-gray-200"
						style="height: {TOTAL_MINUTES * 2}px;"
					>
						<!-- Grid lines -->
						{#each timeLabels as label (label)}
							{@const pos = ((parseTime(label) - CAL_START) / TOTAL_MINUTES) * 100}
							<div
								class="absolute left-0 right-0 border-t border-gray-100"
								style="top: {pos}%;"
							></div>
						{/each}

						<!-- Events -->
						{#each day.events as event (event.time + event.title)}
							{@const pos = eventPosition(event.time)}
							{#if hasCalendarItems(event)}
								<div
									class="absolute left-1 right-1 flex flex-col overflow-hidden rounded px-2 py-1 text-xs leading-tight {evClass(event.type)}"
									style="top: {pos.top}; height: {pos.height};"
									title="{event.time} — {event.title}"
								>
									<button
										class="flex w-full shrink-0 cursor-pointer items-start justify-between gap-1 hover:opacity-80"
										onclick={() => onSelectEvent(event)}
									>
										<span class="font-semibold"
											>{shortLabel(event)}</span
										>
										<span class="shrink-0 text-[0.65rem] opacity-70"
											>{event.time}</span
										>
									</button>
									<div class="mt-1 min-h-0 flex-1 overflow-y-auto" use:scrollFade>
										{#if event.tutorials}
											{#each event.tutorials as tut (tut.id)}
												<button
													class="w-full cursor-pointer rounded px-1 py-0.5 text-left opacity-90 hover:bg-white/20 hover:opacity-100"
													onclick={() => onSelectTutorial(event, tut)}
												>&bull; {tut.title}</button>
											{/each}
										{/if}
										{#if event.parallelSessions}
											{#each event.parallelSessions as sess (sess.title)}
												<button
													class="w-full cursor-pointer rounded px-1 py-0.5 text-left opacity-90 hover:bg-white/20 hover:opacity-100"
													onclick={() => onSelectSession(event, sess)}
												>&bull; {sess.title}</button>
											{/each}
										{/if}
									</div>
								</div>
							{:else if hasDetailContent(event)}
								<button
									class="absolute left-1 right-1 cursor-pointer overflow-hidden rounded px-2 py-1 text-left text-xs leading-tight {evClass(event.type)} hover:brightness-110"
									style="top: {pos.top}; height: {pos.height};"
									title="{event.time} — {event.title}"
									onclick={() => onSelectEvent(event)}
								>
									<div class="flex items-start justify-between gap-1">
										<span class="min-w-0 truncate"
											><span class="font-semibold">{shortLabel(event)}</span
											>{#if displayLocation(event.location)}<span class="opacity-70"
													>&nbsp;· {displayLocation(event.location)}</span
												>{/if}</span
										>
										<span class="shrink-0 text-[0.65rem] opacity-70"
											>{event.time}</span
										>
									</div>
									{#if event.type === 'keynote' && event.speakers && event.speakers.length > 0}
										<span class="opacity-80">{event.speakers.map(s => s.name).join(', ')}</span>
									{/if}
								</button>
							{:else}
								<div
									class="absolute left-1 right-1 overflow-hidden rounded px-2 py-1 text-xs leading-tight {evClass(event.type)}"
									style="top: {pos.top}; height: {pos.height};"
									title="{event.time} — {event.title}{event.location ? ` — ${event.location}` : ''}"
								>
									<div class="flex items-start justify-between gap-1">
										<span class="min-w-0 truncate"
											><span class="font-semibold">{shortLabel(event)}</span
											>{#if displayLocation(event.location)}<span class="opacity-70"
													>&nbsp;· {displayLocation(event.location)}</span
												>{/if}</span
										>
										<span class="shrink-0 text-[0.65rem] opacity-70"
											>{event.time}</span
										>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Mobile list -->
	<div class="space-y-8 md:hidden">
		{#each program as day, i (day.day)}
			{#if activeDay === null || activeDay === i}
				<section>
					<h2
						class="mb-3 border-b-2 border-ic2s2-coral pb-2 text-lg font-bold text-ic2s2-charcoal"
					>
						{day.day} — {day.date}
					</h2>
					<ul class="space-y-1">
						{#each day.events as event (event.time + event.title)}
							{#if hasDetailContent(event)}
								<li>
									<button
										class="flex w-full cursor-pointer items-center gap-3 rounded px-3 py-2 text-left text-sm {evClass(event.type)}"
										onclick={() => onSelectEvent(event)}
									>
										<span class="w-24 shrink-0 text-xs font-bold">{event.time}</span>
										<span
											>{shortLabel(event)}{#if displayLocation(event.location)}<span class="text-xs opacity-70"
													>&nbsp;· {displayLocation(event.location)}</span
												>{/if}</span
										>
									</button>
								</li>
							{:else}
								<li class="flex items-center gap-3 rounded px-3 py-2 text-sm {evClass(event.type)}">
									<span class="w-24 shrink-0 text-xs font-bold">{event.time}</span>
									<span
										>{shortLabel(event)}{#if displayLocation(event.location)}<span class="text-xs opacity-70"
												>&nbsp;· {displayLocation(event.location)}</span
											>{/if}</span
									>
								</li>
							{/if}
						{/each}
					</ul>
				</section>
			{/if}
		{/each}
	</div>
</div>

<style>

	.calendar-bg {
		background-image: repeating-linear-gradient(
			45deg,
			transparent,
			transparent 8px,
			#f3f2f0 8px,
			#f3f2f0 9px
		);
	}

	/* Pale/transparent backgrounds with darker text */
	.ev-registration {
		background-color: #f5f3ef;
		border-color: #e8e4dd;
		color: #5a5044;
	}
	.ev-remarks {
		background-color: #edf2ec;
		border-color: #d4ddd2;
		color: #2e3d2c;
	}
	.ev-lightning {
		background-color: #faf3d9;
		border-color: #e8c96a;
		color: #5c4a0e;
	}
	.ev-keynote {
		background-color: #e3ede7;
		border-color: #2d5a3d;
		color: #1a3a26;
		font-weight: 600;
	}
	.ev-parallel {
		background-color: #e4ecef;
		border-color: #4a6670;
		color: #2e434c;
	}
	.ev-poster {
		background-color: #e6eff4;
		border-color: #5b8fa8;
		color: #2e5468;
	}
	.ev-break {
		background-color: #f5f4f2;
		border-color: #e0ddd8;
		color: #999;
	}
	.ev-lunch {
		background-color: #f5f4f2;
		border-color: #e0ddd8;
		color: #999;
	}
	.ev-tutorial {
		background-color: #f5e8e0;
		border-color: #b56b45;
		color: #6e3a20;
	}
	.ev-social {
		background-color: #f7eed9;
		border-color: #d4a04a;
		color: #5c4210;
	}
</style>
