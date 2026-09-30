<script lang="ts">
	import { Star } from '@lucide/svelte';
	import { savedItems } from '$lib/stores/saved-items.svelte';
	import { dotColors } from './colors';
	import type {
		EventType,
		HydratedDay,
		HydratedEvent,
		ParallelSession,
		Tutorial
	} from '$lib/data/types';

	let {
		day,
		onSelectEvent,
		onSelectSession,
		onSelectTutorial
	}: {
		day: HydratedDay;
		onSelectEvent: (event: HydratedEvent) => void;
		onSelectSession: (event: HydratedEvent, session: ParallelSession) => void;
		onSelectTutorial: (event: HydratedEvent, tutorial: Tutorial) => void;
	} = $props();

	const typeColors: Record<EventType, string> = {
		registration: 'border-l-[#ddd8cc]',
		remarks: 'border-l-[#b8c5b5]',
		lightning: 'border-l-[#e8c96a]',
		keynote: 'border-l-[#2d5a3d]',
		parallel: 'border-l-[#4a6670]',
		poster: 'border-l-[#5b8fa8]',
		break: 'border-l-[#d8d5cf]',
		lunch: 'border-l-[#d8d5cf]',
		tutorial: 'border-l-[#b56b45]',
		social: 'border-l-[#d4a04a]'
	};

	function startTime(time: string): string {
		return time.split('–')[0];
	}

	function duration(time: string): string {
		const parts = time.split('–');
		if (parts.length < 2) return '';
		const [h1, m1] = parts[0].split(':').map(Number);
		const [h2, m2] = parts[1].split(':').map(Number);
		const mins = (h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0));
		if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 ? mins % 60 + 'min' : ''}`.trim();
		return `${mins} min`;
	}

	function hasCards(event: HydratedEvent): boolean {
		return (event.type === 'tutorial' && !!event.tutorials && event.tutorials.length > 0)
			|| (event.type === 'parallel' && !!event.parallelSessions && event.parallelSessions.length > 0);
	}

	function contentClass(event: HydratedEvent): string {
		if (hasCards(event)) return 'flex-1';
		const isPlain = event.type === 'break' || event.type === 'lunch' || event.type === 'registration';
		const bg = isPlain ? 'bg-white' : 'bg-gray-50';
		return `flex-1 rounded-md border border-l-4 border-gray-200 ${bg} py-3 pl-4 pr-3 ${typeColors[event.type]}`;
	}

	function reveal(node: HTMLElement) {
		node.style.opacity = '0';
		node.style.transform = 'translateY(20px)';
		node.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					node.style.opacity = '1';
					node.style.transform = 'translateY(0)';
					observer.unobserve(node);
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<div class="overflow-x-hidden px-4 py-6 md:px-6">
	<h2 class="mb-4 text-lg font-bold text-ic2s2-charcoal md:hidden">
		{day.day} — {day.date}
	</h2>
	<div class="relative">
		<!-- Continuous vertical line -->
		<div class="absolute top-0 bottom-0 left-[60px] w-px bg-gray-200 md:left-[84px]"></div>

		{#each day.events as event (event.time + event.title)}
			<div class="relative flex gap-0 py-4" use:reveal>
				<!-- Left: time -->
				<div class="w-10 shrink-0 pt-1 md:w-16">
					<p class="text-sm font-bold text-gray-800">{startTime(event.time)}</p>
					{#if duration(event.time)}
						<p class="text-[0.65rem] text-gray-400">{duration(event.time)}</p>
					{/if}
				</div>

				<!-- Timeline dot + horizontal connector -->
				<div class="relative mx-3 flex w-4 shrink-0 justify-center">
					<div class="z-10 mt-1.5 h-3 w-3 rounded-full border-2 bg-white" style="border-color: {dotColors[event.type]};"></div>
					<div class="absolute left-1/2 top-[0.85rem] -z-10 h-px w-6 bg-gray-200"></div>
				</div>

				<!-- Right: event content -->
				<div class={contentClass(event)}>
					<!-- Simple events (breaks, lunch, registration, social) -->
					{#if event.type === 'break' || event.type === 'lunch' || event.type === 'registration' || event.type === 'social'}
						<p class="text-sm text-gray-500">{event.title}</p>
						{#if event.location}
							<p class="text-xs text-gray-400">{event.location}</p>
						{/if}

					<!-- Keynotes -->
					{:else if event.type === 'keynote' && event.speakers}
						<button class="group w-full cursor-pointer text-left" onclick={() => onSelectEvent(event)}>
							<span class="text-[0.6rem] font-bold uppercase tracking-wider text-[#2d5a3d]">Keynote</span>
							<div class="mt-1 flex items-center gap-3">
								{#each event.speakers as speaker (speaker.name)}
									<img src={speaker.image} alt={speaker.name} class="h-10 w-10 rounded-full object-cover" />
								{/each}
								<div>
									<p class="text-sm font-semibold text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 group-hover:decoration-ic2s2-coral">{event.speakers.map(s => s.name).join(' & ')}</p>
									{#if event.location}
										<p class="text-xs text-gray-400">{event.location}</p>
									{/if}
								</div>
							</div>
						</button>

					<!-- Lightning talks -->
					{:else if event.type === 'lightning'}
						<button class="group w-full cursor-pointer text-left" onclick={() => onSelectEvent(event)}>
							<span class="text-[0.6rem] font-bold uppercase tracking-wider text-[#4a3d10]">Lightning Talks</span>
							<p class="mt-1 text-sm font-semibold text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 group-hover:decoration-ic2s2-coral">{event.title}</p>
							{#if event.items}
								<p class="text-xs text-gray-400">{event.items.length} talks &middot; {event.location ?? ''}</p>
							{/if}
						</button>

					<!-- Tutorials with cards -->
					{:else if event.type === 'tutorial' && event.tutorials && event.tutorials.length > 0}
						<button class="mb-2 cursor-pointer text-left" onclick={() => onSelectEvent(event)}>
							<span class="text-[0.6rem] font-bold uppercase tracking-wider text-[#b56b45]">{event.title}</span>
						</button>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{#each event.tutorials as tut (tut.id)}
								{@const tutKey = `tutorial-${tut.id}`}
								<div class="relative rounded-md border border-l-4 border-gray-200 bg-white p-3 shadow-sm {typeColors[event.type]}">
									<span class="text-[0.55rem] font-bold uppercase tracking-wider text-amber-700">Tutorial</span>
									<button
										class="mt-1 block w-full cursor-pointer text-left text-xs font-medium leading-snug text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral"
										onclick={() => onSelectTutorial(event, tut)}
									>{tut.title}</button>
									<p class="mt-1 text-[0.6rem] text-gray-400">{tut.tutors.map(t => t.name).join(', ')}</p>
									<button
										class="absolute top-2 right-2 cursor-pointer text-gray-300 hover:text-amber-500"
										onclick={(e) => { e.stopPropagation(); savedItems.toggle(tutKey); }}
										aria-label="Save"
									>
										<Star class="h-3.5 w-3.5" fill={savedItems.has(tutKey) ? 'currentColor' : 'none'} />
									</button>
								</div>
							{/each}
						</div>

					<!-- Tutorial continue (no sub-items) -->
					{:else if event.type === 'tutorial'}
						<p class="text-sm italic text-gray-500">{event.title}</p>

					<!-- Parallel sessions with cards -->
					{:else if event.type === 'parallel' && event.parallelSessions && event.parallelSessions.length > 0}
						<button class="mb-2 cursor-pointer text-left" onclick={() => onSelectEvent(event)}>
							<span class="text-[0.6rem] font-bold uppercase tracking-wider text-[#4a6670]">{event.title}</span>
						</button>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
							{#each event.parallelSessions as sess (sess.title)}
								{@const sessKey = `session-${sess.title}`}
								<div class="relative rounded-md border border-l-4 border-gray-200 bg-white p-3 shadow-sm {typeColors[event.type]}">
									<span class="text-[0.55rem] font-bold uppercase tracking-wider text-slate-500">Session {sess.track}</span>
									<button
										class="mt-1 block w-full cursor-pointer text-left text-xs font-medium leading-snug text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral"
										onclick={() => onSelectSession(event, sess)}
									>{sess.title}</button>
									<p class="mt-1 text-[0.6rem] text-gray-400">{sess.papers.length} papers{#if sess.room}&nbsp;&middot; {sess.room}{/if}</p>
									<button
										class="absolute top-2 right-2 cursor-pointer text-gray-300 hover:text-amber-500"
										onclick={(e) => { e.stopPropagation(); savedItems.toggle(sessKey); }}
										aria-label="Save"
									>
										<Star class="h-3.5 w-3.5" fill={savedItems.has(sessKey) ? 'currentColor' : 'none'} />
									</button>
								</div>
							{/each}
						</div>

					<!-- Poster -->
					{:else if event.type === 'poster'}
						<button class="group w-full cursor-pointer text-left" onclick={() => onSelectEvent(event)}>
							<span class="text-[0.6rem] font-bold uppercase tracking-wider text-[#5b8fa8]">Poster Session</span>
							<p class="mt-1 text-sm font-semibold text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 group-hover:decoration-ic2s2-coral">{event.title}</p>
							{#if event.location}
								<p class="text-xs text-gray-400">{event.location}</p>
							{/if}
						</button>

					<!-- Fallback -->
					{:else}
						<button class="group w-full cursor-pointer text-left" onclick={() => onSelectEvent(event)}>
							<p class="text-sm font-semibold text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 group-hover:decoration-ic2s2-coral">{event.title}</p>
							{#if event.location}
								<p class="text-xs text-gray-400">{event.location}</p>
							{/if}
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
