<script lang="ts">
	import { virtualDaySchedule } from '$lib/data/full-program';
	import type { VirtualSession } from '$lib/data/types';

	function borderColorForSession(session: VirtualSession): string {
		const parallelCount = session.presentations.filter((p) => p.format === 'Parallel').length;
		const posterCount = session.presentations.filter((p) => p.format === 'Poster').length;
		return parallelCount >= posterCount ? 'border-l-[#4a6670]' : 'border-l-[#5b8fa8]';
	}

	function formatBadgeColor(format: 'Parallel' | 'Poster'): string {
		return format === 'Parallel'
			? 'bg-[#4a6670]/10 text-[#4a6670]'
			: 'bg-[#5b8fa8]/10 text-[#5b8fa8]';
	}

	const visitorTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const isET = visitorTz === 'America/New_York' || visitorTz === 'US/Eastern';

	function toLocalTime(etTime: string): string | null {
		if (isET) return null;
		const match = etTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
		if (!match) return null;
		let hours = parseInt(match[1]);
		const minutes = parseInt(match[2]);
		const ampm = match[3].toUpperCase();
		if (ampm === 'PM' && hours !== 12) hours += 12;
		if (ampm === 'AM' && hours === 12) hours = 0;
		const date = new Date(Date.UTC(2026, 6, 21, hours + 4, minutes));
		return date.toLocaleTimeString(undefined, {
			timeZone: visitorTz,
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
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

<div class="flex">
	<!-- Left: main content -->
	<div class="min-w-0 flex-1 overflow-x-hidden px-4 py-6 md:px-6">
		<!-- Header -->
		<div class="mb-6">
			<h2 class="text-xl font-bold text-ic2s2-charcoal">Virtual Day — Tuesday, July 21, 2026</h2>
			<p class="mt-1 text-sm text-gray-500">All times in Eastern Time (ET){#if !isET} — your local time shown in parentheses{/if}</p>
		</div>

		<div class="relative">
			<!-- Continuous vertical line -->
			<div class="absolute top-0 bottom-0 left-[60px] w-px bg-gray-200 md:left-[84px]"></div>

			{#each virtualDaySchedule as slot (slot.time)}
				<div class="relative flex gap-0 py-4" use:reveal>
					<!-- Left: time -->
					<div class="w-10 shrink-0 pt-1 md:w-16">
						<p class="text-sm font-bold text-gray-800">{slot.time}</p>
					</div>

					<!-- Timeline dot + horizontal connector -->
					<div class="relative mx-3 flex w-4 shrink-0 justify-center">
						<div
							class="z-10 mt-1.5 h-3 w-3 rounded-full border-2 bg-white"
							style="border-color: #4a6670;"
						></div>
						<div class="absolute left-1/2 top-[0.85rem] -z-10 h-px w-6 bg-gray-200"></div>
					</div>

					<!-- Right: two track cards side by side -->
					<div class="flex-1">
						<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
							{#each slot.sessions as session (session.track)}
								<div
									class="rounded-md border border-l-4 border-gray-200 bg-white p-4 shadow-sm {borderColorForSession(session)}"
								>
									<!-- Track label -->
									<span class="text-[0.6rem] font-bold uppercase tracking-wider text-gray-500"
										>Track {session.track} &middot; Session {session.session}</span
									>

									<!-- Session theme -->
									<p class="mt-1 text-sm font-semibold text-ic2s2-charcoal">{session.theme}</p>

									<!-- Presentations list -->
									<div class="mt-3 space-y-0">
										{#each session.presentations as pres, i (pres.submission)}
											<div
												class="py-2 {i < session.presentations.length - 1 ? 'border-b border-gray-100' : ''}"
											>
												<div class="flex flex-wrap items-center gap-1.5">
													<span class="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[0.6rem] font-medium text-gray-600">
														{pres.timeET} ET
													</span>
													{#if toLocalTime(pres.timeET)}
														<span class="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[0.6rem] font-medium text-blue-600">
															{toLocalTime(pres.timeET)} local
														</span>
													{/if}
												</div>
												<p class="mt-0.5 text-sm font-semibold leading-snug text-ic2s2-charcoal">
													{pres.title}
												</p>
												<p class="mt-0.5 text-xs text-gray-500">{pres.authors}</p>
												<div class="mt-1">
													<span
														class="inline-block rounded-full px-2 py-0.5 text-[0.6rem] font-medium {formatBadgeColor(pres.format)}"
													>
														{pres.format === 'Parallel' ? 'Talk' : 'Poster'}
													</span>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Right: Schedule at a Glance -->
	<aside class="hidden w-[32%] shrink-0 border-l border-gray-200 bg-gray-50 md:block">
		<div class="sticky top-0 px-5 pt-6 pb-6">
			<h3 class="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400">
				Schedule at a Glance
			</h3>
			<p class="mb-3 text-[0.65rem] text-gray-400">Mon Jul 21 — Eastern Time</p>

			{#each virtualDaySchedule as slot (slot.time)}
				<div class="mt-2">
					<p class="mb-0.5 text-[0.65rem] font-semibold text-ic2s2-charcoal">{slot.time} ET</p>
					<ul class="space-y-0">
						{#each slot.sessions as session (session.track)}
							{@const dotColor = session.presentations.filter(p => p.format === 'Parallel').length >= session.presentations.filter(p => p.format === 'Poster').length ? '#4a6670' : '#5b8fa8'}
							<li class="flex items-start py-0.5">
								<span class="mt-1 mx-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style="background-color: {dotColor};"></span>
								<span class="text-[0.7rem] leading-tight text-gray-600">
									T{session.track}: {session.theme}
									<span class="text-gray-400">({session.presentations.length})</span>
								</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</aside>
</div>
