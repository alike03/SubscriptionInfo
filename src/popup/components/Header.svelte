<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ExternalLink, Settings } from 'lucide-svelte';

	import logo from '../../page/lib/icons/alike.svg';

	export let showSettings = false;

	const dispatch = createEventDispatcher<{
		togglesettings: void;
	}>();
</script>

<header class="relative overflow-hidden border-b border-hover/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))] px-4 pb-3 pt-4">
	<div class="pointer-events-none absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-primary/10 blur-3xl"></div>
	<div class="relative flex items-start justify-between gap-4">
		<div class="flex min-w-0 items-center gap-3">
			<div
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-card shadow-(--shadow-icon)"
			>
				<img src={logo} alt="alike03" class="h-7 w-7 opacity-90" />
			</div>
			<div class="min-w-0 space-y-1">
				<p
					class="inline-flex rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-dim"
				>
					Browser Extension
				</p>
				<h1 class="truncate text-lg font-bold leading-tight text-main">Subscription Info</h1>
				<p class="text-xs text-dim">Track what changed across your subscriptions.</p>
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-2 pt-0.5">
		<a
			href="https://aligueler.com/SubscriptionInfo/"
			target="_blank"
			rel="noreferrer"
			class="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-card/70 px-3 py-2 text-sm font-medium text-dim transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:text-main hover:shadow-[0_12px_28px_-18px_rgba(161,205,68,0.9)]"
			title="Visit website"
		>
			<ExternalLink class="h-4 w-4" />
			<span>Site</span>
		</a>
		<button
			class={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-out cursor-pointer ${
				showSettings
					? 'border-primary/35 bg-primary/15 text-main shadow-[0_12px_28px_-18px_rgba(161,205,68,0.9)]'
					: 'border-white/8 bg-card/70 text-dim hover:-translate-y-0.5 hover:border-primary/30 hover:text-main'
			}`}
			aria-pressed={showSettings}
			on:click={() => dispatch('togglesettings')}
			title="Toggle settings"
		>
			<Settings class="h-4 w-4" />
			<span>Settings</span>
		</button>
		</div>
	</div>
</header>