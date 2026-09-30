<script lang="ts">
	import { navigation, siteConfig } from '$lib/data';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Menu } from '@lucide/svelte';

	interface Props {
		isHomepage?: boolean;
		pageTitle?: string;
	}

	let { isHomepage = false, pageTitle = '' }: Props = $props();
	let mobileOpen = $state(false);

	function isExternal(url: string) {
		return url.startsWith('http');
	}

	function navHref(pageName: string) {
		return isExternal(pageName) ? pageName : `/${pageName}/`;
	}
</script>

<header
	class="relative flex justify-center overflow-hidden {isHomepage
		? 'min-h-[55vh] items-center md:items-end md:pb-30'
		: 'min-h-[38vh] items-center md:items-end md:pb-30'}"
>
	<!-- Video / Image background -->
	{#if isHomepage}
		<video
			autoplay
			playsinline
			muted
			loop
			class="pointer-events-none absolute inset-0 h-full w-full object-cover"
		>
			<source src="/images/venue/background_v3.mp4" type="video/mp4" />
		</video>
	{:else}
		<video
			autoplay
			playsinline
			muted
			loop
			class="pointer-events-none absolute inset-0 h-full w-full object-cover"
		>
			<source src="/images/venue/background_v3.mp4" type="video/mp4" />
		</video>
	{/if}

	<!-- Dark overlay -->
	<div class="absolute inset-0 bg-black/20"></div>

	<!-- Top navigation bar -->
	<nav class="absolute top-6 right-0 left-0 z-50 py-4">
		<div class="mx-auto flex max-w-5xl items-center justify-center px-6 md:px-12">
			<!-- Desktop nav (centered) -->
			<ul class="hidden items-center gap-0 rounded border border-white/30 md:flex">
				<li>
					<a href="/" class="nav-link">Home</a>
				</li>
				{#each navigation as group}
					<li class="nav-item group relative">
						{#if group.items}
							<a href={'#'} class="nav-link">
								{group.name}
							</a>
							<ul
								class="pointer-events-none absolute top-full left-0 rounded border border-white/20 bg-ic2s2-navy/95 opacity-0 shadow-lg transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
							>
								{#each group.items as item}
									<li>
										<a
											href={navHref(item.page)}
											target={isExternal(item.page) ? '_blank' : undefined}
											rel={isExternal(item.page) ? 'noopener noreferrer' : undefined}
											class="block px-5 py-2 text-sm whitespace-nowrap text-white/80 hover:bg-white/10 hover:text-white"
										>
											{item.name}
										</a>
									</li>
								{/each}
							</ul>
						{:else if group.page}
							<a href={navHref(group.page)} class="nav-link">
								{group.name}
							</a>
						{/if}
					</li>
				{/each}
			</ul>

			<!-- Mobile hamburger -->
			<div class="fixed top-4 right-4 z-30 md:hidden">
				<Sheet.Root bind:open={mobileOpen}>
					<Sheet.Trigger>
						{#snippet child({ props })}
							<button {...props} class="cursor-pointer text-white" aria-label="Open menu">
								<Menu class="h-6 w-6" />
							</button>
						{/snippet}
					</Sheet.Trigger>
					<Sheet.Content side="right" class="overflow-y-auto bg-ic2s2-navy text-white">
						<Sheet.Header class="sr-only">
							<Sheet.Title>Menu</Sheet.Title>
						</Sheet.Header>
						<nav class="mt-4 flex flex-col gap-2">
							<a
								href="/"
								class="rounded px-3 py-2 text-base font-bold tracking-wider uppercase hover:bg-white/10"
								onclick={() => (mobileOpen = false)}
							>
								Home
							</a>
							{#each navigation as group}
								{#if group.items}
									<div class="mt-2">
										<span class="px-3 text-sm font-bold tracking-wider text-white/50 uppercase">
											{group.name}
										</span>
										{#each group.items as item}
											<a
												href={navHref(item.page)}
												target={isExternal(item.page) ? '_blank' : undefined}
												class="block rounded px-6 py-1.5 text-base text-white/80 hover:bg-white/10 hover:text-white"
												onclick={() => (mobileOpen = false)}
											>
												{item.name}
											</a>
										{/each}
									</div>
								{:else if group.page}
									<a
										href={navHref(group.page)}
										class="rounded px-3 py-2 text-base font-bold tracking-wider uppercase hover:bg-white/10"
										onclick={() => (mobileOpen = false)}
									>
										{group.name}
									</a>
								{/if}
							{/each}
						</nav>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		</div>
	</nav>

	<!-- Hero content -->
	<div class="relative z-10 text-center text-white">
		{#if isHomepage}
			<img
				src="/images/ic2s2_logo_white.png"
				alt="{siteConfig.title} Logo"
				class="mx-auto mb-4 h-32 md:h-44"
			/>
			<h1 class="text-2xl font-black tracking-[0.25em] text-white uppercase md:text-4xl">
				{siteConfig.location}
			</h1>
		{:else}
			<h1 class="text-3xl font-bold tracking-wide md:text-4xl">{pageTitle}</h1>
		{/if}
	</div>
</header>

<style>
	.nav-link {
		display: inline-block;
		padding: 0.5rem 0.75rem;
		font-size: 0.9rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.25em;
		color: rgba(255, 255, 255, 0.75);
		line-height: 5em;
		transition: color 0.2s;
	}

	.nav-link:hover {
		color: #fff;
	}
</style>
