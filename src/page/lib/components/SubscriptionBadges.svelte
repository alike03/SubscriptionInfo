<script lang="ts">
	import { getPlatformDetails } from '$lib/data';
	import { getTranslations } from '$lib/i18n';
	import { formatDate } from '$lib/utils';
	import type { Language, SubscriptionInfo } from '$lib/types';

	export let subs: SubscriptionInfo[];
	export let language: Language;

	$: translations = getTranslations(language).subscriptionBadge;
</script>

<div class="flex flex-col gap-1.75">
	{#each subs as sub (sub.platform)}
		{@const platform = getPlatformDetails(sub.platform)}
		<div class="flex items-center gap-1.75">
			<div
				class={`${platform.bg} flex h-5 w-5 shrink-0 items-center justify-center rounded-xs`}
			>
				<img src={platform.icon} alt={platform.name} class="h-3 w-3" />
			</div>
			<div class="min-w-0 flex-1">
				<div class="truncate text-[10px] font-semibold text-main">{platform.name}</div>
				{#if sub.leave}
					<p class="text-[9.5px] font-bold text-red">
						{formatDate(sub.entry, language)} - {formatDate(sub.leave, language)}
					</p>
				{:else}
					<p class="text-[9.5px] font-bold text-primary">
						{translations.since(formatDate(sub.entry, language))}
					</p>
				{/if}
			</div>
		</div>
	{/each}
</div>
