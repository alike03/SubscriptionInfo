<script lang="ts">
	import { getTranslations } from '$lib/i18n';
	import type { Language } from '$lib/types';

	import GameActions from './GameActions.svelte';

	export let gameName: string;
	export let sid = 0;
	export let language: Language;

	$: translations = getTranslations(language).subscriptionBadge;
</script>

<div class="alike_cont type-3">
	<div class="sub_text alike">
		<div class="sub_flag alike">{translations.noInfoLabel}</div>
		<span>{translations.noInfo(gameName)}</span>
		<GameActions {gameName} {sid} {language} />
	</div>
</div>
