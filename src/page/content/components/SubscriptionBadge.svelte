<script lang="ts">
	import { getPlatformDetails } from '$lib/data';
	import { getTranslations } from '$lib/i18n';
	import { formatDate } from '$lib/utils';
	import type { Game, SubscriptionInfo } from '$lib/types';
	import type { Language } from '$lib/types';

	export let game: Game;
	export let sub: SubscriptionInfo;
	export let type: number;
	export let language: Language;

	$: platform = getPlatformDetails(sub.platform);
	$: platformName = platform.name;
	$: translations = getTranslations(language).subscriptionBadge;
	$: platformLabel = translations.on(platformName);
	$: entryDate = formatDate(sub.entry, language);
	$: leaveDate = sub.leave ? formatDate(sub.leave, language) : '';
	$: statusClass = sub.leaving ? 'leaving' : sub.leave ? 'left' : 'active';
	$: detailText = sub.leaving
		? sub.leave
			? translations.leavingOn(game.name, platformName, leaveDate)
			: translations.leavingSoon(game.name, platformName)
		: sub.leave
			? translations.leftOn(game.name, platformName, leaveDate)
			: translations.activeSince(game.name, platformName, entryDate);
</script>

{#if type === 3}
	<div class={`sub_text ${statusClass} ${sub.platform}`}>
		<div class={`sub_flag ${sub.platform}`}>{platformLabel}</div>
		<span>{detailText}</span>
	</div>
{:else if type === 6}
	<div class={`sub_flag ${statusClass} ${sub.platform}`}>
		<span class="hover_info">{platformLabel}</span>
	</div>
{:else}
	<div class={`sub_flag ${statusClass} ${sub.platform}`}>{platformLabel}</div>
{/if}
