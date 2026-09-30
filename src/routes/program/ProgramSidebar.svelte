<script lang="ts">
	import EventMeta from './EventMeta.svelte';
	import { ExternalLink, X } from '@lucide/svelte';
	import { dotColors, themeColors } from './colors';
	import { confDays } from '$lib/data/dates';
	import type {
		EventType,
		HydratedEvent,
		HydratedDay,
		ParallelSession,
		ParallelPaper,
		Poster,
		Tutorial,
		Speaker
	} from '$lib/data/types';

	const typeLabels: Record<EventType, string> = {
		registration: 'Registration',
		remarks: 'Remarks',
		lightning: 'Lightning Talks',
		keynote: 'Keynote',
		parallel: 'Parallel Sessions',
		poster: 'Poster Session',
		break: 'Break',
		lunch: 'Lunch',
		tutorial: 'Tutorial',
		social: 'Social Event'
	};

	let {
		selectedEvent,
		selectedSession,
		selectedPaper,
		selectedPoster,
		selectedTutorial,
		selectedSpeaker,
		selectedDay = null,
		selectedDayLabel = '',
		embedded = false,
		onSelectEvent,
		onSelectSession,
		onSelectPaper,
		onSelectPoster,
		onSelectTutorial,
		onSelectSpeaker,
		onGoBack,
		onClose
	}: {
		selectedEvent: HydratedEvent | null;
		selectedSession: ParallelSession | null;
		selectedPaper: ParallelPaper | null;
		selectedPoster: Poster | null;
		selectedTutorial: Tutorial | null;
		selectedSpeaker: Speaker | null;
		selectedDay?: HydratedDay | null;
		selectedDayLabel?: string;
		embedded?: boolean;
		onSelectEvent: (event: HydratedEvent) => void;
		onSelectSession: (session: ParallelSession) => void;
		onSelectPaper: (paper: ParallelPaper) => void;
		onSelectPoster: (poster: Poster) => void;
		onSelectTutorial: (tutorial: Tutorial) => void;
		onSelectSpeaker: (speaker: Speaker) => void;
		onGoBack: () => void;
		onClose: () => void;
	} = $props();


	function glanceSummary(event: HydratedEvent): string {
		if (event.type === 'lightning' && event.items) return `Lightning Talks (${event.items.length} talks)`;
		if (event.type === 'keynote' && event.speakers) return event.speakers.map(s => s.name).join(' & ');
		if (event.type === 'parallel' && event.parallelSessions) return `Parallel Sessions (${event.parallelSessions.length})`;
		if (event.type === 'tutorial' && event.tutorials) return `Tutorials (${event.tutorials.length})`;
		if (event.type === 'poster') return event.title;
		return event.title;
	}

	/** Collect all keynote speakers for a day */
	function daySpeakers(day: HydratedDay): Speaker[] {
		return day.events.flatMap(e => e.speakers ?? []);
	}
</script>

{#if selectedDay && !selectedEvent && !embedded}
	<!-- ==================== DAY AT A GLANCE ==================== -->
	<aside class="w-[38%] shrink-0 border-l border-gray-200 bg-gray-50">
		<div class="sticky top-0 px-6 pt-6 pb-6">
			<h2 class="mb-4 border-b border-gray-200 pb-3 text-lg font-bold text-ic2s2-charcoal">
				{selectedDayLabel} at a glance
			</h2>

			<!-- Schedule summary -->
			<ul class="space-y-0">
				{#each selectedDay.events as event (event.time + event.title)}
					<li>
						<button
							class="flex w-full cursor-pointer items-center py-1 text-left transition-colors hover:bg-gray-100"
							onclick={() => onSelectEvent(event)}
						>
							<span class="w-10 shrink-0 text-[0.7rem] font-bold text-gray-400">{event.time.split('–')[0]}</span>
							<span class="mx-2 h-1.5 w-1.5 shrink-0 rounded-full" style="background-color: {dotColors[event.type]};"></span>
							<span class="text-xs text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral">{glanceSummary(event)}</span>
						</button>
					</li>
				{/each}
			</ul>

			<!-- Keynote speakers for the day -->
			{#if daySpeakers(selectedDay).length > 0}
				<h3 class="mt-6 mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
					Keynote Speakers
				</h3>
				<ul class="space-y-3">
					{#each daySpeakers(selectedDay) as speaker (speaker.name)}
						<li>
							<button
								class="flex w-full cursor-pointer items-center gap-3 rounded px-1 py-2 text-left transition-colors hover:bg-gray-50"
								onclick={() => { const evt = selectedDay?.events.find(e => e.speakers?.includes(speaker)); if (evt) { onSelectEvent(evt); onSelectSpeaker(speaker); } }}
							>
								<img
									src={speaker.image}
									alt={speaker.name}
									class="h-14 w-14 shrink-0 rounded-full object-cover"
								/>
								<div>
									<p class="text-sm font-medium text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral">{speaker.name}</p>
									<p class="text-xs text-gray-500">{speaker.affiliation}</p>
									{#if speaker.title}
										<p class="text-xs italic text-gray-500">{speaker.title}</p>
									{/if}
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</aside>
{:else if selectedEvent}
	<!-- ==================== EVENT DETAIL ==================== -->
	<aside class={embedded ? 'relative' : 'relative w-[38%] shrink-0 border-l border-gray-200 bg-gray-50'}>
		<div class="{embedded ? '' : 'sticky top-0'} px-6 pb-6" style="padding-top: 24px;">
			<!-- Close button (always top-right) -->
			<button
				class="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded text-black hover:bg-gray-200"
				onclick={onClose}
				aria-label="Close panel"><X class="size-6"  /></button
			>

			<!-- Back breadcrumb (only when drilling down) -->
			{#if selectedPaper && selectedSession}
				<button class="mb-1 cursor-pointer text-sm text-gray-400 hover:text-gray-600" onclick={onGoBack}>
					&larr; {selectedSession.title}
				</button>
			{:else if selectedPoster}
				<button class="mb-1 cursor-pointer text-sm text-gray-400 hover:text-gray-600" onclick={onGoBack}>
					&larr; {selectedEvent.title}
				</button>
			{:else if selectedPaper && selectedTutorial}
				<button class="mb-1 cursor-pointer text-sm text-gray-400 hover:text-gray-600" onclick={onGoBack}>
					&larr; {selectedTutorial.title}
				</button>
			{:else if (selectedSession || selectedTutorial || selectedSpeaker) && selectedDay}
				<button class="mb-1 cursor-pointer text-sm text-gray-400 hover:text-gray-600" onclick={onGoBack}>
					&larr; Day at a glance
				</button>
			{:else if selectedSession || selectedTutorial || selectedSpeaker}
				<button class="mb-1 cursor-pointer text-sm text-gray-400 hover:text-gray-600" onclick={onGoBack}>
					&larr; {selectedEvent.title}
				</button>
			{:else if selectedDay}
				<button class="mb-1 cursor-pointer text-sm text-gray-400 hover:text-gray-600" onclick={onClose}>
					&larr; Day at a glance
				</button>
			{/if}

			<!-- Event type badge (only at Level 0) -->
			{#if !selectedSession && !selectedTutorial && !selectedSpeaker && !selectedPaper && !selectedPoster}
				<span class="mb-3 inline-block rounded px-3 py-1 text-sm font-bold ev-{selectedEvent.type}">
					{typeLabels[selectedEvent.type]}
				</span>
			{/if}

			<!-- Title (hidden at Level 0 when redundant with badge) -->
			{#if selectedPaper || selectedPoster || selectedSession || selectedTutorial || selectedSpeaker || selectedEvent.title !== typeLabels[selectedEvent.type]}
				<h2
					class="mb-4 pb-1 text-lg font-bold text-ic2s2-charcoal"
				>
					{#if selectedPaper}
						{selectedPaper.title}
					{:else if selectedPoster}
						{selectedPoster.title}
					{:else if selectedSession}
						{selectedSession.title}
					{:else if selectedTutorial}
						{selectedTutorial.title}
					{:else if selectedSpeaker}
						{selectedSpeaker.name}
					{:else}
						{selectedEvent.title}
					{/if}
				</h2>
			{/if}



			<!-- Level 2: Single paper detail -->
			{#if selectedPaper}
				<div class="space-y-4">
					<p class="text-sm text-gray-600">{selectedPaper.authors}</p>
					<EventMeta day={selectedDayLabel} time={selectedEvent.time} location={selectedEvent.location} id={selectedPaper.submission} />
					{#if selectedPaper.abstract}
						<div>
							<h3
								class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400"
							>
								Abstract
							</h3>
							<p class="whitespace-pre-line text-sm leading-relaxed text-gray-700">
								{selectedPaper.abstract}
							</p>
						</div>
					{/if}
				</div>

				<!-- Level 2: Single poster detail -->
			{:else if selectedPoster}
				<div class="space-y-4">
					<span
						class="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
						style="background-color: {themeColors[selectedPoster.theme] ?? '#999'};"
					>
						{selectedPoster.theme}
					</span>
					<p class="text-sm text-gray-600">{selectedPoster.authors}</p>
					<EventMeta day={selectedDayLabel} time={selectedEvent.time} location={selectedEvent.location} id={selectedPoster.id} />
					{#if selectedPoster.keywords}
						<div>
							<h3 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
								Keywords
							</h3>
							<p class="text-sm text-gray-600">{selectedPoster.keywords}</p>
						</div>
					{/if}
					{#if selectedPoster.abstract}
						<div>
							<h3 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
								Abstract
							</h3>
							<p class="whitespace-pre-line text-sm leading-relaxed text-gray-700">
								{selectedPoster.abstract}
							</p>
						</div>
					{/if}
				</div>

				<!-- Level 1: Single session — list of papers -->
			{:else if selectedSession}
				<div class="space-y-4">
					<EventMeta day={confDays[selectedSession.day - 1]?.label} time={selectedEvent.time} location={selectedSession.room ?? selectedEvent.location} track="Track {selectedSession.track}" />

					{#if selectedSession.chair ?? selectedEvent.chairs}
						<p class="border-y border-gray-200 py-2 text-sm text-gray-500">Chair: {selectedSession.chair ?? selectedEvent.chairs}</p>
					{/if}

					<p class="text-xs font-bold uppercase tracking-wide text-gray-400">
						{selectedSession.papers.length} Talks
					</p>

					<ul class="space-y-0">
						{#each selectedSession.papers as paper (paper.submission)}
							<li class="border-b border-gray-100 last:border-0">
								<button
									class="w-full cursor-pointer px-1 py-3 text-left transition-colors hover:bg-gray-50"
									onclick={() => onSelectPaper(paper)}
								>
									<div class="flex items-start justify-between gap-2">
										<p class="text-sm font-medium text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral">{paper.title}</p>
										<span class="shrink-0 text-xs text-gray-300">&rsaquo;</span>
									</div>
									<p class="mt-1 text-xs text-gray-500">{paper.authors}</p>
								</button>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Level 1: Single tutorial detail -->
			{:else if selectedTutorial}
				<div class="space-y-4">
					<EventMeta day={confDays[0].label} time={selectedTutorial.time} location={selectedTutorial.room} />

					<p class="text-xs font-bold uppercase tracking-wide text-gray-400">
						{selectedTutorial.tutors.length} Tutors
					</p>

					<ul class="space-y-3 text-sm">
						{#each selectedTutorial.tutors as tutor (tutor.name)}
							<li class="flex items-center gap-3">
								{#if tutor.image}
									<img
										src={tutor.image}
										alt={tutor.name}
										class="h-16 w-16 shrink-0 rounded-full object-cover"
									/>
								{/if}
								<div>
									{#if tutor.website}
										<a href={tutor.website} class="font-medium text-ic2s2-coral hover:underline">{tutor.name}</a>
									{:else}
										<span class="font-medium">{tutor.name}</span>
									{/if}
									<p class="text-xs text-gray-500">{tutor.affiliation}</p>
								</div>
							</li>
						{/each}
					</ul>

					{#if selectedTutorial.website}
						<div>
							<h3 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Website</h3>
							<a
								href={selectedTutorial.website}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1.5 text-sm text-ic2s2-coral hover:underline"
							>
								Visit tutorial website
								<ExternalLink class="size-4" aria-hidden="true" />
							</a>
						</div>
					{/if}

					<div>
						<h3 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Description</h3>
						<p class="text-sm leading-relaxed text-gray-700">{selectedTutorial.abstract}</p>
					</div>
				</div>

				<!-- Level 1: Single speaker detail -->
			{:else if selectedSpeaker}
				<div class="space-y-4">
					<EventMeta day={selectedDayLabel} time={selectedEvent.time} location={selectedEvent.location} />

					<div class="flex items-start gap-4">
						<img
							src={selectedSpeaker.image}
							alt={selectedSpeaker.name}
							class="w-28 shrink-0 rounded object-contain"
						/>
						<div>
							{#if selectedSpeaker.url}
								<a href={selectedSpeaker.url} class="font-medium text-ic2s2-coral hover:underline">{selectedSpeaker.name}</a>
							{:else}
								<span class="font-medium">{selectedSpeaker.name}</span>
							{/if}
							<p class="text-sm text-gray-500">{selectedSpeaker.affiliation}</p>
							{#if selectedSpeaker.field}
								<p class="text-xs text-gray-400">{selectedSpeaker.field}</p>
							{/if}
							{#if selectedSpeaker.title}
								<p class="mt-1 text-sm italic text-gray-600">{selectedSpeaker.title}</p>
							{/if}
						</div>
					</div>

					{#if selectedEvent.chairs}
						<p class="border-y border-gray-200 py-2 text-sm text-gray-500">Chair: {selectedEvent.chairs}</p>
					{/if}

					{#if selectedSpeaker.abstract}
						<div>
							<h3 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Abstract</h3>
							<p class="text-sm leading-relaxed text-gray-700">{@html selectedSpeaker.abstract}</p>
						</div>
					{/if}

					{#if selectedSpeaker.bio}
						<div>
							<h3 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Bio</h3>
							<p class="text-sm leading-relaxed text-gray-700">{@html selectedSpeaker.bio}</p>
						</div>
					{/if}
				</div>

				<!-- Level 0: Event overview -->
			{:else}
				<!-- Metadata bar for Level 0 -->
				<EventMeta day={selectedDayLabel} time={selectedEvent.time} location={selectedEvent.location} />

				{#if selectedEvent.chairs}
					<p class="border-y border-gray-200 py-2 text-sm text-gray-500">Chair: {selectedEvent.chairs}</p>
				{/if}

				<!-- Parallel sessions — list -->
				{#if selectedEvent.parallelSessions && selectedEvent.parallelSessions.length > 0}
					<p class="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">
						{selectedEvent.parallelSessions.length} Sessions
					</p>
					<ul class="space-y-0">
						{#each selectedEvent.parallelSessions as sess (sess.title)}
							<li class="border-b border-gray-100 last:border-0">
								<button
									class="w-full cursor-pointer px-1 py-3 text-left transition-colors hover:bg-gray-50"
									onclick={() => onSelectSession(sess)}
								>
									<div class="flex items-start justify-between gap-2">
										<p class="text-sm font-medium text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral">{sess.title}</p>
										<span class="shrink-0 text-xs text-gray-300">&rsaquo;</span>
									</div>
									<p class="mt-1 text-xs text-gray-400">
										Track {sess.track} &middot; {sess.papers.length} papers
									</p>
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				<!-- Posters — list -->
				{#if selectedEvent.posterSession && selectedEvent.posterSession.posters.length > 0}
					<p class="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">
						{selectedEvent.posterSession.posters.length} Posters
					</p>
					<ul class="space-y-0">
						{#each selectedEvent.posterSession.posters as poster (poster.id)}
							<li class="border-b border-gray-100 last:border-0">
								<button
									class="w-full cursor-pointer px-1 py-3 text-left transition-colors hover:bg-gray-50"
									onclick={() => onSelectPoster(poster)}
								>
									<div class="flex items-start justify-between gap-2">
										<p class="text-sm font-medium text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral">{poster.title}</p>
										<span class="shrink-0 text-xs text-gray-300">&rsaquo;</span>
									</div>
									<p class="mt-1 text-xs text-gray-500">{poster.authors}</p>
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				<!-- Tutorials — list -->
				{#if selectedEvent.tutorials && selectedEvent.tutorials.length > 0}
					<p class="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">
						{selectedEvent.tutorials.length} Tutorials
					</p>
					<ul class="space-y-0">
						{#each selectedEvent.tutorials as tut (tut.id)}
							<li class="border-b border-gray-100 last:border-0">
								<button
									class="w-full cursor-pointer px-1 py-3 text-left transition-colors hover:bg-gray-50"
									onclick={() => onSelectTutorial(tut)}
								>
									<div class="flex items-start justify-between gap-2">
										<p class="text-sm font-medium text-ic2s2-charcoal underline decoration-gray-300 underline-offset-2 hover:decoration-ic2s2-coral">{tut.title}</p>
										<span class="shrink-0 text-xs text-gray-300">&rsaquo;</span>
									</div>
									<p class="mt-1 text-xs text-gray-400">
										{tut.tutors.map((t) => t.name).join(', ')}
									</p>
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				<!-- Keynote speakers — distinct abstracts (joint keynotes share one), then each speaker with their bio -->
				{#if selectedEvent.speakers && selectedEvent.speakers.length > 0}
					{@const abstracts = [...new Set(selectedEvent.speakers.map((s) => s.abstract).filter(Boolean))]}
					{#each abstracts as abstract (abstract)}
						<div class="mt-4">
							<h3 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Abstract</h3>
							<p class="text-sm leading-relaxed text-gray-700">{@html abstract}</p>
						</div>
					{/each}
					{#each selectedEvent.speakers as speaker (speaker.name)}
						<div class="mt-4 space-y-3 border-t border-gray-100 pt-4">
							<div class="flex items-start gap-4">
								<img
									src={speaker.image}
									alt={speaker.name}
									class="w-28 shrink-0 rounded object-contain"
								/>
								<div>
									{#if speaker.url}
										<a href={speaker.url} class="font-medium text-ic2s2-coral hover:underline">{speaker.name}</a>
									{:else}
										<span class="font-medium">{speaker.name}</span>
									{/if}
									<p class="text-sm text-gray-500">{speaker.affiliation}</p>
									{#if speaker.field}
										<p class="text-xs text-gray-400">{speaker.field}</p>
									{/if}
									{#if speaker.title}
										<p class="mt-1 text-sm italic text-gray-600">{speaker.title}</p>
									{/if}
								</div>
							</div>
							{#if speaker.bio}
								<div>
									<h3 class="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Bio</h3>
									<p class="text-sm leading-relaxed text-gray-700">{@html speaker.bio}</p>
								</div>
							{/if}
						</div>
					{/each}
				{/if}

				<!-- Lightning talks / remarks items -->
				{#if selectedEvent.items && selectedEvent.items.length > 0}
					<p class="mt-4 text-xs font-bold uppercase tracking-wide text-gray-400">
						{selectedEvent.items.length} Talks
					</p>
					<ul class="space-y-0">
						{#each selectedEvent.items as item (item.title)}
							<li class="border-b border-gray-100 py-3 last:border-0">
								<div class="flex items-start gap-3">
									{#if item.time}
										<span class="w-10 shrink-0 text-xs font-bold text-gray-400">{item.time}</span>
									{/if}
									<div>
										<p class="text-sm font-medium text-ic2s2-charcoal">{item.title}</p>
										{#if item.presenters}
											<p class="mt-1 text-xs text-gray-500">{item.presenters}</p>
										{/if}
									</div>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</div>
	</aside>
{/if}

<style>
	.ev-registration { background-color: #f0ece4; color: #6b6256; }
	.ev-remarks { background-color: #d4ddd2; color: #3a4a38; }
	.ev-lightning { background-color: #e8c96a; color: #4a3d10; }
	.ev-keynote { background-color: #2d5a3d; color: #fff; }
	.ev-parallel { background-color: #4a6670; color: #fff; }
	.ev-poster { background-color: #5b8fa8; color: #fff; }
	.ev-break { background-color: #eae8e3; color: #999; }
	.ev-lunch { background-color: #eae8e3; color: #999; }
	.ev-tutorial { background-color: #b56b45; color: #fff; }
	.ev-social { background-color: #d4a04a; color: #3d2e0a; }
</style>
