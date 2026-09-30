<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import importedProgram from '$lib/data/full-program/program-2027.json';
	import type { EventType, ParallelSession, PosterSession, SessionItem } from '$lib/data/types';
	import { X } from '@lucide/svelte';

	interface ImportedSessionItem extends SessionItem {
		abstract?: string;
	}

	interface ImportedEvent {
		time: string;
		title: string;
		type: EventType;
		location?: string;
		items?: ImportedSessionItem[];
		parallelSessions?: ParallelSession[];
		posterSession?: PosterSession;
	}

	interface ImportedDay {
		day: string;
		date: string;
		events: ImportedEvent[];
	}

	type PresentationKind = 'Paper' | 'Poster' | 'Lightning talk';

	interface PresentationDetail {
		kind: PresentationKind;
		title: string;
		authors: string;
		abstract?: string;
		day: string;
		time: string;
		session?: string;
	}

	const program2027 = importedProgram as unknown as ImportedDay[];
	let selected = $state<PresentationDetail | null>(null);

	function openDetail(
		kind: PresentationKind,
		title: string,
		authors: string,
		abstract: string | undefined,
		day: string,
		time: string,
		session?: string
	) {
		selected = { kind, title, authors, abstract, day, time, session };
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') selected = null;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<Section variant="gray" title="Program">
	<div class="mx-auto max-w-5xl">
		<div class="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
			<strong>Draft program.</strong> The information shown here is imported from the 2027 program spreadsheet
			and currently contains example content.
		</div>

		<div class="space-y-10">
			{#each program2027 as day, dayIndex (day.day)}
				<section aria-labelledby="program-day-{dayIndex}">
					<header class="mb-4 border-b-2 border-ic2s2-coral pb-3">
						<p class="text-xs font-bold tracking-widest text-ic2s2-coral uppercase">{day.day}</p>
						<h2 id="program-day-{dayIndex}" class="text-2xl font-bold text-ic2s2-charcoal">
							{day.date}
						</h2>
					</header>

					<div class="space-y-4">
						{#each day.events as event (`${event.time}-${event.title}`)}
							<article
								class="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[7rem_1fr]"
							>
								<div>
									<p class="font-bold text-ic2s2-charcoal">{event.time}</p>
									<p class="text-xs tracking-wide text-gray-400 uppercase">{event.type}</p>
								</div>

								<div>
									<h3 class="font-semibold text-ic2s2-charcoal">{event.title}</h3>
									{#if event.location}
										<p class="text-xs text-gray-400">{event.location}</p>
									{/if}

									{#if event.items}
										<ul class="mt-3 divide-y divide-gray-100">
											{#each event.items as item, itemIndex (`${item.time}-${itemIndex}`)}
												<li class="py-3">
													<button
														type="button"
														class="presentation-link"
														onclick={() =>
															openDetail(
																'Lightning talk',
																item.title,
																item.presenters ?? '',
																item.abstract,
																day.date,
																event.time,
																event.title
															)}
													>
														<span class="presentation-title">{item.title}</span>
														<span class="presentation-authors">{item.presenters}</span>
													</button>
												</li>
											{/each}
										</ul>
									{/if}

									{#if event.parallelSessions}
										<div class="mt-4 grid gap-4 lg:grid-cols-2">
											{#each event.parallelSessions as session (session.title)}
												<section class="rounded-md border border-gray-200 p-3">
													<h4 class="text-sm font-bold text-ic2s2-charcoal">{session.title}</h4>
													<p class="mb-2 text-xs text-gray-400">Track {session.track}</p>
													<ul class="divide-y divide-gray-100">
														{#each session.papers as paper (paper.submission)}
															<li class="py-2">
																<button
																	type="button"
																	class="presentation-link"
																	onclick={() =>
																		openDetail(
																			'Paper',
																			paper.title,
																			paper.authors,
																			paper.abstract,
																			day.date,
																			event.time,
																			session.title
																		)}
																>
																	<span class="presentation-title">{paper.title}</span>
																	<span class="presentation-authors">{paper.authors}</span>
																</button>
															</li>
														{/each}
													</ul>
												</section>
											{/each}
										</div>
									{/if}

									{#if event.posterSession}
										<details class="mt-3 rounded border border-gray-200 p-3">
											<summary class="cursor-pointer text-sm font-medium">
												View {event.posterSession.posters.length} posters
											</summary>
											<ul class="mt-2 divide-y divide-gray-100">
												{#each event.posterSession.posters as poster (poster.id)}
													<li class="py-2">
														<button
															type="button"
															class="presentation-link"
															onclick={() =>
																openDetail(
																	'Poster',
																	poster.title,
																	poster.authors,
																	poster.abstract,
																	day.date,
																	event.time,
																	event.title
																)}
														>
															<span class="presentation-title">{poster.title}</span>
															<span class="presentation-authors">{poster.authors}</span>
														</button>
													</li>
												{/each}
											</ul>
										</details>
									{/if}
								</div>
							</article>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</div>
</Section>

{#if selected}
	<button
		type="button"
		class="fixed inset-0 z-[60] cursor-default bg-black/35"
		aria-label="Close presentation details"
		onclick={() => (selected = null)}
	></button>
	<aside
		class="fixed top-0 right-0 z-[70] h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"
		aria-label="Presentation details"
	>
		<button
			type="button"
			class="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded hover:bg-gray-100"
			aria-label="Close presentation details"
			onclick={() => (selected = null)}
		>
			<X class="h-6 w-6" />
		</button>

		<div class="pr-12">
			<span class="inline-block rounded bg-ic2s2-charcoal px-3 py-1 text-xs font-bold text-white"
				>{selected.kind}</span
			>
			<h2 class="mt-4 text-2xl font-bold text-ic2s2-charcoal">{selected.title}</h2>
			<p class="mt-3 text-gray-600">{selected.authors}</p>
		</div>

		<dl
			class="mt-6 grid grid-cols-[5rem_1fr] gap-x-3 gap-y-2 border-y border-gray-200 py-4 text-sm"
		>
			<dt class="font-semibold text-gray-500">Day</dt>
			<dd>{selected.day}</dd>
			<dt class="font-semibold text-gray-500">Time</dt>
			<dd>{selected.time}</dd>
			{#if selected.session}
				<dt class="font-semibold text-gray-500">Session</dt>
				<dd>{selected.session}</dd>
			{/if}
		</dl>

		{#if selected.abstract}
			<div class="mt-6">
				<h3 class="text-xs font-bold tracking-wide text-gray-400 uppercase">Abstract</h3>
				<p class="mt-2 leading-relaxed whitespace-pre-line text-gray-700">{selected.abstract}</p>
			</div>
		{/if}
	</aside>
{/if}

<style>
	.presentation-link {
		display: block;
		width: 100%;
		cursor: pointer;
		text-align: left;
	}

	.presentation-title {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: underline;
		text-decoration-color: #d1d5db;
		text-underline-offset: 2px;
	}

	.presentation-link:hover .presentation-title {
		text-decoration-color: var(--ic2s2-coral);
	}

	.presentation-authors {
		display: block;
		font-size: 0.75rem;
		color: #6b7280;
	}
</style>
