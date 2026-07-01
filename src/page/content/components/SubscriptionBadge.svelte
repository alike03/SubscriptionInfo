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
	$: entryDate = formatDate(sub.entry, language);
	$: leaveDate = sub.leave ? formatDate(sub.leave, language) : '';
	$: leavesInFuture = !!sub.leave && new Date(sub.leave).getTime() > Date.now();
	$: hasLeft = !!sub.leave && !leavesInFuture;
	$: isComing = !sub.leaving && !sub.leave && new Date(sub.entry).getTime() > Date.now();
	$: platformLabel = hasLeft
		? translations.left(platformName)
		: sub.leaving || leavesInFuture
			? translations.leaving(platformName)
			: isComing
				? translations.coming(platformName)
				: translations.on(platformName);
	$: statusClass = hasLeft
		? 'left'
		: sub.leaving || leavesInFuture
			? 'leaving'
			: isComing
				? 'soon'
				: 'active';
	$: detailText = hasLeft
		? translations.leftOn(game.name, platformName, leaveDate)
		: leavesInFuture
			? translations.leavingOn(game.name, platformName, leaveDate)
			: sub.leaving
				? translations.leavingSoon(game.name, platformName)
				: isComing
					? translations.comingOn(game.name, platformName, entryDate)
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
