<script lang="ts">
	import { Coffee, Github, HeartPlus, Twitter } from 'lucide-svelte';

	const supportLinks = [
		{
			label: 'PayPal',
			href: 'https://paypal.me/alike03',
			icon: 'paypal',
			iconClasses: 'bg-primary/12 text-primary',
		},
		{
			label: 'Ko-fi',
			href: 'https://ko-fi.com/alike03',
			icon: 'kofi',
			iconClasses: 'bg-yellow/15 text-yellow',
		},
		{
			label: 'GitHub',
			href: 'https://github.com/alike03/SubscriptionInfo',
			icon: 'github',
			iconClasses: 'bg-white/8 text-main',
		},
		{
			label: 'X',
			href: 'https://x.com/alike03',
			icon: 'x',
			iconClasses: 'bg-secondary/15 text-secondary',
		},
	];
</script>

<section class="border-t border-hover bg-section/40 px-4 py-4">
	<div class="mb-3 flex items-start justify-between gap-3">
		<div>
			<h3 class="text-sm font-semibold text-main">Support</h3>
			<p class="mt-1 text-xs text-dim">Support the project or follow future updates.</p>
		</div>
		<span
			class="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary"
		>
			alike03
		</span>
	</div>

	<div class="grid grid-cols-4 gap-2">
		{#each supportLinks as link}
			<a
				href={link.href}
				target="_blank"
				rel="noreferrer"
				class="flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-card/70 px-2.5 py-2.5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:text-main"
			>
				<div
					class={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${link.iconClasses}`}
				>
					{#if link.icon === 'paypal'}
						<HeartPlus class="h-4 w-4" />
					{:else if link.icon === 'kofi'}
						<Coffee class="h-4 w-4" />
					{:else if link.icon === 'github'}
						<Github class="h-4 w-4" />
					{:else}
						<Twitter class="h-4 w-4" />
					{/if}
				</div>
				<p class="truncate text-xs font-semibold text-main">{link.label}</p>
			</a>
		{/each}
	</div>
</section>