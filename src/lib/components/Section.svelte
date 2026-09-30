<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'coral' | 'white' | 'gray';
		title?: string;
		class?: string;
		children: Snippet;
	}

	let { variant = 'white', title, class: className, children }: Props = $props();

	const variantClasses = {
		coral: 'bg-ic2s2-coral text-white overlay',
		white: 'bg-white text-ic2s2-charcoal',
		gray: 'bg-ic2s2-gray text-ic2s2-charcoal overlay'
	};

	const titleBg = {
		coral: 'bg-ic2s2-coral text-white overlay',
		white: 'bg-white text-ic2s2-charcoal',
		gray: 'bg-ic2s2-gray text-ic2s2-charcoal overlay'
	};
</script>

<section class={cn('relative py-16 md:py-20', variantClasses[variant], className)}>
	{#if title}
		<div
			class={cn(
				'section-title absolute left-1/2 top-px -translate-x-1/2 -translate-y-full',
				'flex items-end justify-center pb-1',
				'h-[3.25em] w-[25em] max-w-[90vw]',
				'text-center text-[0.9em] font-bold uppercase tracking-[0.25em]',
				titleBg[variant]
			)}
		>
			{title}
		</div>
	{/if}
	<div class="mx-auto max-w-5xl px-6 md:px-12">
		{@render children()}
	</div>
</section>

<style>
	.section-title::before {
		content: '';
		position: absolute;
		bottom: -38px;
		left: -35px;
		width: 35px;
		height: 38px;
		background: url('/images/ui/shadow.png');
	}

	.section-title::after {
		content: '';
		position: absolute;
		bottom: -38px;
		right: -35px;
		width: 35px;
		height: 38px;
		background: url('/images/ui/shadow.png');
		transform: scaleX(-1);
	}

	:global(.overlay) {
		background-image: url('/images/ui/overlay.png');
		background-repeat: repeat;
	}
</style>
