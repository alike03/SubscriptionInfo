<script lang="ts">
	import browser from 'webextension-polyfill';

	import { getTranslations } from '$lib/i18n';
	import type { Language } from '$lib/types';

	export let gameName: string;
	export let sid: number;
	export let language: Language;

	const IG_AFFILIATE_TAG = 'alike03';

	let open = false;
	let message = '';
	let state: 'idle' | 'sending' | 'sent' | 'failed' = 'idle';

	$: translations = getTranslations(language).gameActions;
	$: buyUrl = `https://www.instant-gaming.com/en/search/?q=${encodeURIComponent(
		gameName,
	)}&igr=${IG_AFFILIATE_TAG}`;

	function toggle() {
		open = !open;
		if (open && state !== 'sending') state = 'idle';
	}

	async function submit() {
		const text = message.trim();
		if (!text || state === 'sending') return;

		state = 'sending';
		try {
			const response = (await browser.runtime.sendMessage({
				type: 'report-error',
				data: { sid, game: gameName, url: window.location.href, message: text },
			})) as { ok?: boolean } | undefined;

			if (response?.ok) {
				state = 'sent';
				message = '';
			} else {
				state = 'failed';
			}
		} catch {
			state = 'failed';
		}
	}
</script>

<div class="alike_actions">
	<a
		class="alike_action"
		href={buyUrl}
		target="_blank"
		rel="noopener noreferrer"
		title={translations.buyOn}
		aria-label={translations.buyOn}
	>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="8" cy="21" r="1" />
			<circle cx="19" cy="21" r="1" />
			<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
		</svg>
	</a>
	<button
		class="alike_action"
		class:active={open}
		type="button"
		title={translations.reportError}
		aria-label={translations.reportError}
		on:click={toggle}
	>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</svg>
	</button>

	{#if open}
		<div class="alike_report" role="dialog" aria-label={translations.reportError}>
			<div class="alike_report_head">
				<span>{translations.reportError}</span>
				<button type="button" aria-label={translations.close} on:click={() => (open = false)}>
					×
				</button>
			</div>
			{#if state === 'sent'}
				<p class="alike_report_status ok">{translations.reportSent}</p>
			{:else}
				<textarea
					rows="4"
					maxlength="2000"
					placeholder={translations.reportPlaceholder}
					bind:value={message}
					disabled={state === 'sending'}
				></textarea>
				{#if state === 'failed'}
					<p class="alike_report_status err">{translations.reportFailed}</p>
				{/if}
				<button
					class="alike_report_send"
					type="button"
					disabled={state === 'sending' || !message.trim()}
					on:click={submit}
				>
					{translations.reportSend}
				</button>
			{/if}
		</div>
	{/if}
</div>
