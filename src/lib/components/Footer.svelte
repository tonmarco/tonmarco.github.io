<script lang="ts">
	import { siteConfig, socialMedia } from '$lib/data';
	import { Home, MessageCircle, Mail } from '@lucide/svelte';
</script>

<footer class="bg-ic2s2-footer pt-12 pb-8 text-white/50">

	<div class="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 md:grid-cols-3 md:px-12">
		<!-- Address -->
		<div class="relative pl-12">
			<span class="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-ic2s2-slate text-white">
				<Home class="h-4 w-4" />
			</span>
			<h3 class="mb-3 text-sm font-bold text-white">Address</h3>
			{#each siteConfig.address as line}
				{#if line.html}
					<p class="text-sm leading-relaxed">{@html line.html}</p>
				{:else if line.text}
					<p class="text-sm leading-relaxed">{line.text}</p>
				{/if}
			{/each}
		</div>

		<!-- Social -->
		{#if socialMedia.show}
			<div class="relative pl-12">
				<span class="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-ic2s2-slate text-white">
					<MessageCircle class="h-4 w-4" />
				</span>
				<h3 class="mb-3 text-sm font-bold text-white">Social</h3>
				{#each socialMedia.links as social}
					<p>
						<a
							href={social.link}
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-white hover:text-white/80"
						>
							{social.title}
						</a>
					</p>
				{/each}
			</div>
		{/if}

		<!-- Email -->
		<div class="relative pl-12">
			<span class="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-ic2s2-slate text-white">
				<Mail class="h-4 w-4" />
			</span>
			<h3 class="mb-3 text-sm font-bold text-white">Email</h3>
			<a
				href="mailto:{siteConfig.emails.general}"
				class="text-sm text-white hover:text-white/80"
			>
				{siteConfig.emails.general}
			</a>
		</div>
	</div>
</footer>
