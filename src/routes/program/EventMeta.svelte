<script lang="ts">
	import { Calendar, Clock, MapPin, Hash } from '@lucide/svelte';

	let {
		day = '',
		time = '',
		location = '',
		track = '',
		id
	}: {
		day?: string;
		time?: string;
		location?: string;
		track?: string;
		id?: number;
	} = $props();
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-gray-200 py-3 text-xs text-gray-500">
	{#if day}
		<span class="flex items-center gap-1">
			<Calendar class="h-3.5 w-3.5" />
			{day}
		</span>
	{/if}
	{#if time}
		<span class="flex items-center gap-1">
			<Clock class="h-3.5 w-3.5" />
			{time}
		</span>
	{/if}
	{#if location}
		<span class="flex items-center gap-1">
			<MapPin class="h-3.5 w-3.5" />
			{location}
		</span>
	{/if}
	{#if track}
		<span class="flex items-center gap-1">
			{track}
		</span>
	{/if}
	{#if id !== undefined}
		<span class="flex items-center gap-1">
			<Hash class="h-3.5 w-3.5" />
			{id}
		</span>
	{/if}
</div>
