<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ExternalLink, Settings } from 'lucide-svelte';

	import logo from '../../page/lib/icons/alike.svg';

	export let showSettings = false;

	const dispatch = createEventDispatcher<{
		togglesettings: void;
	}>();
</script>

<header class="flex items-center justify-between bg-section px-4 py-3">
	<div class="flex items-center gap-3">
		<img src={logo} alt="alike03" class="h-8 w-8 opacity-80" />
		<h1 class="text-lg font-bold">Subscription Info</h1>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="https://aligueler.com/SubscriptionInfo/"
			target="_blank"
			class="rounded-md p-2 text-dim transition-colors hover:bg-hover hover:text-main"
			title="Visit website"
		>
			<ExternalLink class="h-5 w-5" />
		</a>
		<button
			class={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-out ${
				showSettings
					? 'bg-hover text-main shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]'
					: 'text-dim hover:bg-hover hover:text-main'
			}`}
			aria-pressed={showSettings}
			on:click={() => dispatch('togglesettings')}
			title="Toggle settings"
		>
			<Settings
				class={`h-5 w-5 transition-transform duration-200 ease-out ${
					showSettings ? 'rotate-90' : 'rotate-0'
				}`}
			/>
			<span>Settings</span>
		</button>
	</div>
</header>