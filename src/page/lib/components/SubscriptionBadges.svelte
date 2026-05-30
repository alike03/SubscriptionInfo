<script lang="ts">
	import { getPlatformDetails } from '$lib/data';
	import { getTranslations } from '$lib/i18n';
	import { formatDate } from '$lib/utils';
	import type { Language, SubscriptionInfo } from '$lib/types';

	export let subs: SubscriptionInfo[];
	export let language: Language;

	$: translations = getTranslations(language).subscriptionBadge;
</script>

<div class="space-y-1.5 sm:space-y-2">
	{#each subs as sub}
		{@const platform = getPlatformDetails(sub.platform)}
		<div class="flex items-center gap-1.5 sm:gap-2">
			<div
				class={`${platform.bg} rounded-md p-0.5 transition-shadow duration-1000 group-hover:shadow-icon sm:p-1 ${platform.shadow} group-hover:duration-300`}
			>
				<img src={platform.icon} alt={platform.name} class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
			</div>
			<div class="flex-1">
				<span class="text-xs font-medium sm:text-sm">{platform.name}</span>
				{#if sub.leave}
					<p class="text-[10px] text-red sm:text-xs">
						{formatDate(sub.entry, language)} - {formatDate(sub.leave, language)}
					</p>
				{:else}
					<p class="text-[10px] text-primary sm:text-xs">
						{translations.since(formatDate(sub.entry, language))}
					</p>
				{/if}
			</div>
		</div>
	{/each}
</div>
