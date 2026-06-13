<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ExternalLink, Settings } from 'lucide-svelte';
	import type { Translations } from '$lib/i18n';

	const logo = import.meta.env.DEV ? 'http://localhost:5173/icon/48.png' : '/icon/48.png';

	export let showSettings = false;
	export let translations: Translations['header'];

	const dispatch = createEventDispatcher<{
		togglesettings: void;
	}>();
</script>

<header class="relative overflow-hidden border-b border-hover/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))] px-4 py-2.5">
	<div class="pointer-events-none absolute right-0 top-0 h-14 w-14 -translate-y-4 translate-x-4 rounded-full bg-primary/10 blur-3xl"></div>
	<div class="relative flex items-center justify-between gap-4">
		<div class="flex min-w-0 items-center gap-2.5">
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-white/8 bg-card shadow-(--shadow-raised)"
			>
				<img src={logo} alt="alike03" class="h-5.5 w-5.5 opacity-90" />
			</div>
			<div class="min-w-0">
				<h1 class="truncate text-base font-bold leading-tight text-main">alike03's Subscription Info</h1>
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-2">
		<a
			href="https://sub.aligueler.com"
			target="_blank"
			rel="noreferrer"
			class="inline-flex items-center gap-1.5 rounded-sm border border-white/8 bg-card/70 px-2.5 py-1.5 text-[12px] font-medium text-dim transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:text-main"
			title={translations.visitWebsite}
		>
			<ExternalLink class="h-3.5 w-3.5" />
			<span>{translations.site}</span>
		</a>
		<button
			class={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[12px] font-medium transition-all duration-200 ease-out cursor-pointer ${
				showSettings
					? 'border-primary/40 bg-primary/16 text-main shadow-(--shadow-glow)'
					: 'border-white/8 bg-card/70 text-dim hover:-translate-y-0.5 hover:border-primary/30 hover:text-main'
			}`}
			aria-pressed={showSettings}
			on:click={() => dispatch('togglesettings')}
			title={translations.toggleSettings}
		>
			<Settings class="h-3.5 w-3.5" />
			<span>{translations.settings}</span>
		</button>
		</div>
	</div>
</header>