<script lang="ts">
	import Supporters from './Supporters.svelte';
	import { Coffee, Github, HeartPlus, ShoppingBag, Twitter } from 'lucide-svelte';
	import type { Translations } from '$lib/i18n';

	export let translations: Translations;

	const supportLinks = [
		{
			label: 'PayPal',
			href: 'https://paypal.me/alike03',
			icon: 'paypal',
		},
		{
			label: 'Ko-fi',
			href: 'https://ko-fi.com/alike03',
			icon: 'kofi',
		},
		{
			label: 'Instant Gaming',
			href: 'https://www.instant-gaming.com/?igr=alike03',
			icon: 'instant',
		},
		{
			label: 'GitHub',
			href: 'https://github.com/alike03/SubscriptionInfo',
			icon: 'github',
		},
		{
			label: 'X',
			href: 'https://x.com/alike03',
			icon: 'x',
		},
	];
</script>

<section class="border-t border-hover px-4 py-4">
	<div class="mb-3">
		<h3 class="text-xs font-bold uppercase tracking-label text-dim">{translations.support.title}</h3>
		<p class="mt-1.5 max-w-75 text-xs leading-relaxed text-dim">{translations.support.subtitle}</p>
	</div>

	<div class="grid grid-cols-5 gap-2">
		{#each supportLinks as link (link.label)}
			<a
				href={link.href}
				target="_blank"
				rel="noreferrer"
				class="flex items-center justify-center gap-2.25 rounded-sm border border-white/8 bg-card/60 px-2.5 py-2.75 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:text-main"
			>
				<div
					class="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-white/6 text-main"
				>
					{#if link.icon === 'paypal'}
						<HeartPlus class="h-3.5 w-3.5" />
					{:else if link.icon === 'kofi'}
						<Coffee class="h-3.5 w-3.5" />
					{:else if link.icon === 'github'}
						<Github class="h-3.5 w-3.5" />
					{:else if link.icon === 'instant'}
						<ShoppingBag class="h-3.5 w-3.5" />
					{:else}
						<Twitter class="h-3.5 w-3.5" />
					{/if}
				</div>
				<p class="truncate text-xs font-semibold text-main">{link.label}</p>
			</a>
		{/each}
	</div>

	<Supporters translations={translations.supporters} />
</section>
