<script lang="ts">
	import Section from './Section.svelte';

	interface Props {
		title: string;
	}

	let { title }: Props = $props();
</script>

<Section variant="gray" {title}>
	<div class="mx-auto prose max-w-3xl text-center">
		<p>Information for IC2S2 2027 will be announced here as it becomes available.</p>
	</div>
</Section>
